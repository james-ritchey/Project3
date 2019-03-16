import React, { Component } from "react";
import { Link } from "react-router-dom";

class Lobby extends Component {

  render() {
    return (
      <div>
        <h1>Lobby</h1>
        <ul>
          <li><Link to={{ pathname: '/game/1', state: { users: this.props.users } }}>Room 1</Link></li>
          <li><Link to={{ pathname: '/game/2', state: { users: this.props.users } }}>Room 2</Link></li>
          <li><Link to={{ pathname: '/game/3', state: { users: this.props.users } }}>Room 3</Link></li>
          <li><Link to={{ pathname: '/game/4', state: { users: this.props.users } }}>Room 4</Link></li>
          <li><Link to={{ pathname: '/game/5', state: { users: this.props.users } }}>Room 5</Link></li>
          <li><Link to={{ pathname: '/game/6', state: { users: this.props.users } }}>Room 6</Link></li>
          <li><Link to={{ pathname: '/game/7', state: { users: this.props.users } }}>Room 7</Link></li>
          <li><Link to={{ pathname: '/game/8', state: { users: this.props.users } }}>Room 8</Link></li>
          <li><Link to={{ pathname: '/game/9', state: { users: this.props.users } }}>Room 9</Link></li>
          <li><Link to={{ pathname: '/game/10', state: { users: this.props.users } }}>Room 10</Link></li>
        </ul>
      </div>
    )
  }

}

export default Lobby;