import React, { Component } from "react";
import { Link } from "react-router-dom";

class Lobby extends Component {

  render() {
    return (
      <div>
        <h1>Lobby</h1>
        <ol>
          <li><Link to={{ pathname: '/game/numbers', state: { users: this.props.users } }}>Room 1</Link></li>
        </ol>
      </div>
    )
  }

}

export default Lobby;