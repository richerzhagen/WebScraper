import React, { Component } from "react";
import ListGroup from "react-bootstrap/ListGroup";
// import Button from "react-bootstrap/Button";
import Heart from "./png/heart.png";
import Comment from "./png/comment.png";
import Retweets from "./png/retweet.png";
// import { faHome } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
class TweetItem extends Component {
  getContentStyle = () => {
    return {
      display: "inline-block",
      paddingLeft: "10px",
      paddingRight: "10px",
      fontStyle: "italic",
      float: "left",
    };
  };
  getRightStyle = () => {
    return {
      //   textDecoration: this.props.item.active ? "none" : "line-through",
      display: "inline-block",
      //   cursor: "pointer",
      float: "right",
    };
  };
  getUserStyle = () => {
    return {
      paddingLeft: "10px",
      display: "inline-block",
      // float: "left",
    };
  };
  getDateStyle = () => {
    return {
      paddingRight: "10px",
      color: "#22222280",
      display: "inline-block",
      float: "right",
    };
  };
  getBlockStyle = () => {
    return {
      // display: "block",
      margin: "0 auto",
    }
  }
  //   handleToggle(_id) {
  //     this.props.toggleUrl(_id);
  //   }

  //   handleDel(_id) {
  //     this.props.delUrl(_id);
  //   }

  render() {
    // const { _id, url, active } = this.props.item;
    // const { _id, author, content, likes, favourites, retweets } = this.props.item;
    const {
      date,
      user,
      content,
      commentCount,
      favoriteCount,
      retweetCount,
    } = this.props.item;
    return (
      <div style={divStyle}>
        {/* <div style={this.getBlockStyle()}> */}
          <p style={this.getUserStyle()}>{user}</p>
          <p style={this.getDateStyle()}>{date}</p>
        {/* </div> */}
        {/* <p style={this.getStyle()} onClick={this.handleToggle.bind(this, _id)}> */}
        {/* <FontAwesomeIcon icon={faHome} /> */}
        <br/>
        {/* <div style={this.getBlockStyle()}> */}
          <p style={this.getContentStyle()}>{content}</p>
        {/* </div> */}
        <div style={this.getBlockStyle()}>
          <p style={this.getRightStyle()}>
            <img src={Comment} style={{ height: "28px" }} /> {commentCount}{" "}
            <img src={Heart} style={{ height: "28px" }} /> {favoriteCount}{" "}
            <img src={Retweets} style={{ height: "28px" }} /> {retweetCount}
          </p>
        </div>

        {/* <Button
          variant="dark"
          onClick={this.handleDel.bind(this, _id)}
          style={btnStyle}
        >
          Delete
        </Button> */}
      </div>
    );
  }
}

// const btnStyle = {
//   display: "inline-block",
//   cursor: "pointer",
//   float: "right",
// };

const divStyle = {
  // height: "60px",
  // padding: "10px",
  // marginBottom:
};

const listGroupStyle = {
  marginBottom: "5px",
};

class TweetList extends Component {
  render() {
    return this.props.tweets.map((item) => (
      // <h4 key={item._id} style={{backgroundColor: "#b2b2b2"}}>
      // <h4 key={item._id} >
      <ListGroup.Item key={item._id} as="li" style={listGroupStyle}>
        {/* <TweetItem item={item} toggleUrl={this.props.toggleUrl} delUrl={this.props.delUrl}/> */}
        <TweetItem item={item} />
      </ListGroup.Item>
      // </h4>
    ));
  }
}

export default TweetList;
