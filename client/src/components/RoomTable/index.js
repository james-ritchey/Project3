import React, { Component } from "react";
import { Link } from "react-router-dom";
import openSocket from 'socket.io-client';


class RoomTable extends Component {

    constructor(props) {
      super(props);

      this.state = {
        socket: openSocket('http://localhost:4000')
      }

      let self = this;
      this.state.socket.on('gameCreated', (game) => {
        console.log(game);
      })
    }
    
    render() {
        return (
            <div>
                <h3>Lobby</h3>
                <ul>
                <li><Link to={{ pathname: '/game', state: { users: this.props.user } }}>Room 1</Link></li>
                </ul>
            </div>
        )
    }
}

export default RoomTable;