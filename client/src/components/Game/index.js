import React, { Component } from 'react';
import Phaser from 'phaser';
import Gamejs from './game';


export class Game extends Component {
  componentDidMount() {
    var config = {
      type: Phaser.AUTO,
      parent: 'phaser-game',
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { y: 0 }
        }
      },
      scene: {Gamejs},
    };

    var game = new Phaser.Game(config);

  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return (
      <div>
        <div id="phaser-game"></div>
      </div>
      
    );
  }
}

export default Game;