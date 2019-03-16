import React, { Component } from 'react';
import Phaser from 'phaser';
import openSocket from 'socket.io-client';

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
      scene: { 
        preload: preload,
        create: create,
        update: update
      }
    };

    var game = new Phaser.Game(config);
    

    function preload() {
      this.load.image('ship', '/game/assets/player_ship_orange.png');
      this.load.image('otherPlayer', '/game/assets/other_player_ship.png');
      this.load.image('star', '/game/assets/star_gold.png');
    }
   
    function create() {
      var self = this;
      this.otherPlayers = this.physics.add.group();
      this.socket = openSocket('http://localhost:4000');
      this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
          if (players[id].playerId === self.socket.id) {
            addPlayer(self, players[id]);
          } else {
            addOtherPlayers(self, players[id]);
          }
        });
      });
      this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
      });
      this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
          }
        });
      });
    
      this.cursors = this.input.keyboard.createCursorKeys();
    
      this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setRotation(playerInfo.rotation);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
        });
      });

      this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
      this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });
        
      this.socket.on('scoreUpdate', function (scores) {
        self.blueScoreText.setText('Blue: ' + scores.blue);
        self.redScoreText.setText('Red: ' + scores.red);
      });
    
      this.socket.on('starLocation', function (starLocation) {
        if (self.star) self.star.destroy();
        self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
        self.physics.add.overlap(self.ship, self.star, function () {
          this.socket.emit('starCollected');
        }, null, self);
      });
    
    }
   
    function update() {
      if (this.ship) {
        if (this.cursors.left.isDown) {
          console.log("test");
          this.ship.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
          this.ship.setAngularVelocity(150);
        } else {
          this.ship.setAngularVelocity(0);
        }
      
        if (this.cursors.up.isDown) {
          this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
        } else {
          this.ship.setAcceleration(0);
        }
        
        // emit player movement
        var x = this.ship.x;
        var y = this.ship.y;
        var r = this.ship.rotation;
        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
          this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
        }
        
        // save old position data
        this.ship.oldPosition = {
          x: this.ship.x,
          y: this.ship.y,
          rotation: this.ship.rotation
        };
    
        this.physics.world.wrap(this.ship, 5);
      }
    }
  

    function addPlayer(self, playerInfo) {
      console.log("add")
      self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
      if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
      } else {
        self.ship.setTint(0xff0000);
      }
      self.ship.setDrag(100);
      self.ship.setAngularDrag(100);
      self.ship.setMaxVelocity(200);
    }

    function addOtherPlayers(self, playerInfo) {
      console.log("addother")
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
    }

  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return (
      <div className="phaser-div">
        <h1>{console.log(this.props)}</h1>
        <div id="phaser-game"></div>
      </div>
      
    );
  }
}

export default Game;