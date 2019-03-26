import React, { Component } from "react";
import { Link } from "react-router-dom";
import openSocket from 'socket.io-client';


class RoomTable extends Component {

    constructor(props) {
      super(props);

      this.state = {
        socket: openSocket('http://localhost:4000'),
        gameIdList: []
      }
      
      this.state.socket.on('gameCreated', ({gameId}) => {
        let gameList = this.state.gameIdList;
        gameList.push(gameId);
        this.setState({ gameIdList: gameList });
      });

    }

    createGame = () => {
      this.state.socket.emit('createGame')
    }

    createGameList = () => {
      let htmlArray = [];
      for(let i = 0; i < this.state.gameIdList.length; i++) {
        htmlArray.push(<li><Link to={{ pathname: '/game', state: { gameId: this.state.gameIdList[i] } }}>Room {this.state.gameIdList[i]}</Link></li>)
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
                <button onClick={this.createGame}>Create Game</button>
            </div>
        )
    }
}

export default RoomTable;