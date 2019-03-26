import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";


class RoomTable extends Component {

    constructor(props) {
      super(props);
      this.state = {
        socket: this.props.socket,
        gameIdList: [],
        gameCreator: false
      }
      
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

    joinGame = (gameId) => {
      const data = {
        gameId: gameId
      };
      
      this.state.socket.emit('joinGame', data)
    }

    createGameList = () => {
      let htmlArray = [];
      for(let i = 0; i < this.state.gameIdList.length; i++) {
        htmlArray.push(<li><Link onClick={() => this.joinGame(this.state.gameIdList[i])} to={{ pathname: '/game', state: { host: false } }}>Room {this.state.gameIdList[i]}</Link></li>)
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
                <Link onClick={this.createGame} to={{pathname: '/game', state: { host: true }}}>
                  Test
                </Link>
            </div>
        )
    }
}

export default RoomTable;