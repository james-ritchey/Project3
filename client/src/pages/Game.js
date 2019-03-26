import React, { Component } from "react";
import GameComponent from "../components/Game";
import "./Game.css";
import SocketContext from "../socketContext";
//import { Link } from "react-router-dom";

class Game extends Component {
  componentDidMount() {

  }
  render() {
    return (
      <div>
        <SocketContext.Consumer>
          {socket => <GameComponent user={this.props.user} socket={socket} />}
        </SocketContext.Consumer>
      </div>
    )
  }
}

export default Game;