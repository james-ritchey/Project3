import React, { Component } from "react";
import GameComponent from "../components/Game";
import "./Game.css";
//import { Link } from "react-router-dom";

class Game extends Component {
  componentDidMount() {

  }
  render() {
    return (
      <div>
        <GameComponent user={this.props.user} />
      </div>
    )
  }
}

export default Game;