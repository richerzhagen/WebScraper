import React, { Component } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ListGroup from "react-bootstrap/ListGroup";
import CrawlList from "./CrawlList";
import TweetList from "./TweetList";
import AddUrl from "./AddUrl";
import SideBar from "./SideBar";
import { SideBarItems } from "./SideBarJson";
// import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Switch, Route } from "react-router-dom";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ws: null,
      toCrawl: [],
      tweets: [
        {
          _id:0,
          date:"today",
          user:"donald trump",
          content:"i am the president",
          commentCount: "2",
          favoriteCount: "0",
          retweetCount: "1"
        },
        {
          _id:1,
          date:"also today",
          user:"donald trump",
          content:"look at me",
          commentCount: "4",
          favoriteCount: "1",
          retweetCount: "2"
        },
      ],
    };
  }

  // single websocket instance for the own application and constantly trying to reconnect.
  componentDidMount() {
    this.connect();
  }

  timeout = 250; // Initial timeout duration as a class variable

  // This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
  connect = () => {
    var ws = new WebSocket("ws://localhost:4000/ws");
    let that = this; // cache the this
    var connectInterval;

    // websocket onopen event listener
    ws.onopen = () => {
      console.log("connected websocket main component");

      this.setState({ ws: ws });

      that.timeout = 250; // reset timer to 250 on open of websocket connection
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    //to receive the message from server
    ws.onmessage = function (e) {
      var data = JSON.parse(e.data);
      console.log(data);

      switch (data.status) {
        case "url-list":
          that.setState({ toCrawl: data.content });
          break;
          case "tweet-list":
            that.setState({ tweets: data.content });
            break;
          case "add-url":
          that.setState({ toCrawl: [...that.state.toCrawl, data.content] });
          break;
        case "del-url":
          that.setState({
            toCrawl: [
              ...that.state.toCrawl.filter((item) => item._id !== data.content),
            ],
          });
          break;
        case "toggle-url":
          that.setState({
            toCrawl: that.state.toCrawl.map((item) => {
              if (item._id === data.content._id) {
                // item.active = !item.active;
                item = data.content;
              }
              return item;
            }),
          });
          that.setState({
            toCrawl: [
              ...that.state.toCrawl.filter((item) => item._id !== data.content),
            ],
          });
          break;
        default:
          console.log("error: " + data);
      }
    };

    // websocket onclose event listener
    ws.onclose = (e) => {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second.`,
        e.reason
      );
      that.timeout = that.timeout + that.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
    };

    // websocket onerror event listener
    ws.onerror = (err) => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );

      ws.close();
    };
  };

  // reconnect if connection gets closed
  check = () => {
    const { ws } = this.state;
    if (!ws || ws.readyState === WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
  };

  // add url
  addUrl = (url) => {
    try {
      this.state.ws.send(JSON.stringify({ content: url, status: "add-url" }));
    } catch (error) {
      console.log(error);
    }
  };

  // delete url
  delUrl = (id) => {
    try {
      this.state.ws.send(JSON.stringify({ content: id, status: "del-url" }));
    } catch (error) {
      console.log(error);
    }
  };

  // toggle active
  toggleUrl = (id) => {
    try {
      this.state.ws.send(JSON.stringify({ content: id, status: "toggle-url" }));
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div className="App">
        <div style={leftStyle}>
          <SideBar items={SideBarItems} />
        </div>
        <Switch>
          <Route path="/tweetslist">
            <NavigateTweetsList tweets={this.state.tweets} />
          </Route>
          <Route path="/scrapelist">
            <NavigateCrawlList
              addUrl={this.addUrl}
              toCrawl={this.state.toCrawl}
              toggleUrl={this.toggleUrl}
              delUrl={this.delUrl}
            />
          </Route>
        </Switch>
      </div>
    );
  }
}

class NavigateCrawlList extends Component {
  render() {
    return (
      <div style={rightStyle}>
        <AddUrl addUrl={this.props.addUrl} />
        <ListGroup as="ul">
          <CrawlList
            toCrawl={this.props.toCrawl}
            toggleUrl={this.props.toggleUrl}
            delUrl={this.props.delUrl}
          />
        </ListGroup>
      </div>
    );
  }
}

class NavigateTweetsList extends Component {
  render() {
    return (
      <div style={rightStyle}>
        <h3 style={{ color: "#ffffff" }}>tweetslist</h3>
        <ListGroup as="ul">
          <TweetList tweets={this.props.tweets} />
        </ListGroup>
      </div>
    );
  }
}

const leftStyle = {
  height: "100%",
  width: "160px",
  position: "fixed",
  zIndex: "1",
  top: "0",
  left: "0",
  backgroundColor: "#222222",
  overflowX: "hidden",
  paddingTop: "20px",
  borderRight: "1px solid #2f2f2f",
};

const rightStyle = {
  marginLeft: "160px",
  fontSize: "28px",
  padding: "0px 10px",
};

export default App;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
