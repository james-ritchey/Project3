import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { createDecipher } from "crypto";


class RoomTable extends Component {

    constructor(props) {
      super(props);
      this.state = {
        socket: this.props.socket,
        gameIdList: [],
        gameCreator: false,
        playerId: null,
        players: {}
      }
      this.state.socket.on('gameCreated', ({gameId}) => {
        let gameList = this.state.gameIdList;
        gameList.push(gameId);
        this.setState({ gameIdList: gameList });
      });

      this.state.socket.on('roomRemove', (gameId) => {
        let gameList = this.state.gameIdList;
        let updatedList = gameList.filter(id => id !== gameId);
        this.setState({ gameIdList: updatedList });
      });

      this.state.socket.emit('roomRequest');

      this.state.socket.on('roomResponse', (roomList) => {
        
        this.setState({ gameIdList: roomList });
      })

    }

    createGameList = () => {
      let htmlArray = [];
      for(let i = 0; i < this.state.gameIdList.length; i++) {
        htmlArray.push(<li><Link to={{ pathname: '/game', state: { host: false, gameId: this.state.gameIdList[i] } }}>Room {this.state.gameIdList[i]}</Link></li>)
      }

      return htmlArray;
    }
    
    render() {
        return (
            <div>
                <h3>Lobby</h3>
                <ul>
                  {this.createGameList()}
                </ul>
                <Link to={{pathname: '/game', state: { host: true }}}>
                  Test
                </Link>

            </div>
        )
    }
}

export default RoomTable;