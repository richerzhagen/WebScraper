"use strict";

const express = require("express");
const app = express();
var port = 4000;
const router = express.Router();
var crawlList = [];
var tweetList = [];

//#region mongodb
const mongoose = require("mongoose");
// initialise mongodb connection
mongoose.connect("mongodb://localhost:27017/nodedb", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
let db = mongoose.connection;

// check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// check for db errors
db.on("error", function (err) {
  console.log(err);
});

let schemaUrl = mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

let schemaTweet = mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  commentCount: {
    type: String,
    required: true,
  },
  retweetCount: {
    type: String,
    required: true,
  },
  favoriteCount: {
    type: String,
    required: true,
  },
});

var ModelUrl = mongoose.model("modelurl", schemaUrl, "UrlCollection");
var ModelTweet = mongoose.model("modeltweet", schemaTweet, "TweetCollection");

//#region url db functions
var saveUrl = (url) => {
  var doc1 = new ModelUrl({ url: url, active: true });
  doc1.save(function (err, doc) {
    if (err) return console.error(err);
    console.log("Document inserted succussfully!");
  });
  return doc1._id;
};

var delUrl = (id) => {
  ModelUrl.findByIdAndDelete(id, function (err) {
    if (err) console.log(err);
    console.log("Successful deletion");
  });
};

var toggleUrl = (id) => {
  ModelUrl.findById(id, function (err, doc) {
    if (err) console.log(err);
    doc.active = !doc.active;
    doc.save(function (err) {
      if (err) console.log(err);
      var json = {
        content: doc,
        status: "toggle-url",
      };
      wss.broadcast(JSON.stringify(json));
    });
  });
};

router.route("/fetch").get(function (req, res) {
  ModelUrl.find({}, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

ModelUrl.find({}, function (err, result) {
  if (err) {
    console.log("error");
    throw err;
  }
  crawlList = result;
});

var getUrls = () => {
  ModelUrl.find({}, function (err, result) {
    if (err) {
      console.log("error");
      throw err;
    }
    crawlList = result;
  });
};
//#endregion

var getTweets = () => {
  ModelTweet.find({}, function (err, result) {
    if (err) {
      console.log("error");
      throw err;
    }
    tweetList = result;
  });
};

// var saveTweet = (tweet) => {
//   var doc1 = new ModelTweet({
//     date: "tweet.date",
//     tweet: "tweet.content",
//     commentCount: "tweet.commentCount",
//     retweetCount: "tweet.retweetCount",
//     favoriteCount: "tweet.favoriteCount",
//   });
//   doc1.save(function (err, doc) {
//     if (err) return console.error(err);
//     console.log("Document inserted succussfully!");
//   });
//   return doc1._id;
// };
var saveTweet = (tweet) => {
  var doc1 = new ModelTweet({
    date: tweet.date,
    content: tweet.content,
    user: tweet.user,
    commentCount: tweet.commentCount,
    retweetCount: tweet.retweetCount,
    favoriteCount: tweet.favoriteCount,
  });
  doc1.save(function (err, doc) {
    if (err) return console.error(err);
    console.log("Document inserted succussfully!");
  });
  return doc1._id;
};

// db.collection.find({_id: "myId"}, {_id: 1}).limit(1)
// ModelTweet.find({_id: "myId"}, {_id: 1}).limit(1)

// ModelTweet.find({}, function (err, result) {
//   if (err) {
//     console.log("error");
//     throw err;
//   }
// crawlList = result;
// });

//#endregion

//#region router

app.use("/", router);

router.get("/status", function (req, res) {
  res.json({ status: "app is running" });
});

var server = app.listen(port, function () {
  console.log("server is running on port " + port);
});

//#endregion

//#region websocket
const SocketServer = require("ws").Server;
const wss = new SocketServer({ server });
var clients = [];

wss.broadcast = function (data) {
  for (var i in clients) {
    clients[i].send(data);
  }
};

//init websocket ws and handle incomming request
wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));

  // on receive message
  ws.on("message", function incoming(message) {
    let data = JSON.parse(message);
    console.log(data);
    switch (data.status) {
      case "add-url":
        var newid = saveUrl(data.content);
        var json = {
          content: { _id: newid, url: data.content, active: true },
          status: "add-url",
        };
        wss.broadcast(JSON.stringify(json));
        break;
      case "del-url":
        delUrl(data.content);
        var json = {
          content: data.content,
          status: "del-url",
        };
        wss.broadcast(JSON.stringify(json));
        break;
      case "toggle-url":
        console.log(data.content);
        toggleUrl(data.content);
        break;
      default:
        console.log("error: " + data);
    }
  });
  getUrls();
  getTweets();
  ws.send(JSON.stringify({ content: crawlList, status: "url-list" }));
  ws.send(JSON.stringify({ content: tweetList, status: "tweet-list" }));
});

//#endregion

//#region webscraper
const twitter = require("./twitter");

(async () => {
  await twitter.initialize();

  //optional
  //let user = await twitter.getUser('realDonaldTrump');

  let tweets = await twitter.getTweets("realDonaldTrump");
  console.log(tweets);
  tweets.forEach((tweet) => {
    // debugger; 
    saveTweet(tweet); // works
  });
})();
//#endregion
