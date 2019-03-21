import React, { Component } from "react";
import HighScoreTable from "../components/HighScoreTable";
import RoomTable from "../components/RoomTable";

import "./Lobby.css";

class Lobby extends Component {

  render() {
    return (
      <div>
      <div className="lobbyContainer">
        <div className="lobbyDiv">
          <RoomTable user={this.props.user} />
        </div>
        <div className="HighScoreContainer">
          <HighScoreTable />
        </div>
      </div>
      </div>
    )
  }

}

export default Lobby;