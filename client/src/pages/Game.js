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
        {console.log("Game", this.props)}
        <SocketContext.Consumer>
          {socket => <GameComponent host={this.props.data.host} user={this.props.user} socket={socket} />}
        </SocketContext.Consumer>
      </div>
    )
  }
}

export default Game;