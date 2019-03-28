import React, { Component } from "react";
import HighScoreTable from "../components/HighScoreTable";
import RoomTable from "../components/RoomTable";

import "./Lobby.css";
import SocketContext from "../socketContext";

class Lobby extends Component {

  render() {
    return (
      <div>
      <div className="lobbyContainer">
        <div className="lobbyDiv">
        <SocketContext.Consumer>
          {socket => <RoomTable user={this.props.user} socket={socket} />}
        </SocketContext.Consumer>

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