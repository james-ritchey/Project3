import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import openSocket from 'socket.io-client';


class RoomTable extends Component {

    constructor(props) {
      super(props);

      this.state = {
        socket: openSocket('http://localhost:4000'),
        gameIdList: [],
        gameCreator: false,
        playerId: null
      }
      
      // client side socket event to send playerId to backend
      this.state.socket.on('connect', function(){
        //                                    //
        // Insert playerId data handling here //
        //                                    //
        this.state.socket.emit('playerId', {
            playerId: this.state.playerId
        })
      })

      this.state.socket.on('gameCreated', ({gameId}) => {
        let gameList = this.state.gameIdList;
        gameList.push(gameId);
        this.setState({ gameIdList: gameList });
      });

    }

    createGame = () => {
      this.state.socket.emit('createGame')
      this.setState({ gameCreator: true })
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
                {console.log(this.state.socket)}
                <Link onClick={this.createGame} to={{pathname: '/game', state: { gameId: "test" }}}>
                  Test
                </Link>
            </div>
        )
    }
}

export default RoomTable;