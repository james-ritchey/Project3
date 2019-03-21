import React, { Component } from "react";
import HighScoreTable from "../components/HighScoreTable";
import RoomTable from "../components/RoomTable";
import "./Lobby.css";

class Lobby extends Component {

  render() {
    return (
      <div className="lobbyContainer">
      <div className="lobbyHeader">
      asdfasdfasdf
      </div>
        <div className="lobbyDiv">
          <h1>Lobby</h1>
          <RoomTable user={this.props.user} />
        </div>
        <div className="HighScoreContainer">
          <HighScoreTable />
        </div>
      </div>
    )
  }

}

export default Lobby;