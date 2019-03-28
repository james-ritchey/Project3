import React, { Component } from 'react';
import Phaser from 'phaser';
import Nav from '../Nav/index';
/* eslint react/prop-types: 0 */

export class Game extends Component {
  constructor(props){
    super(props);
    this.state = {
      socket: this.props.socket,
      gameIdList: [],
      gameCreator: false,
      players: {},
    }

    if(this.props.host === true) {
      this.state.socket.emit('createGame')
    } else if(this.props.gameId !== undefined) {
      const data = {
        gameId: this.props.gameId
      };
      this.state.socket.emit('joinGame', data)
    }


  }
  

  componentDidMount() {
    let socket = this.props.socket;
    var config = {
      type: Phaser.AUTO,
      parent: 'phaser-game',
      width: 800,
      height: 600,
      physics: {
          default: 'arcade',
          arcade: {
              debug: false,
              }
      },
      scene: {
          preload: preload,
          create: create,
          update: update,
      } 
    };

    var game = new Phaser.Game(config);
    var fireButton;
    var resetButton;
    var isHost = this.props.host;
    var enemyData = {};
    var scale = 2.5;

    var gameManager = {
        started: false,
        round: 1,
        spawnedRows: 0,
        //Scores are held here under the player socket ID
        players: {},
        numOfDeadPlayers: 0,
        lives: 3,
        scoreTexts: {},
        enemiesOnScreen: 0,
        enemies: {
            row1: [],
            row2: [],
            row3: [],
            row4: [],
            row5: [],
            row6: [],
            dead: {
                row1: [],
                row2: [],
                row3: [],
                row4: [],
                row5: [],
                row6: [],
            }
        }
    }


    // Preload function for the Phaser engine
    function preload() {
      this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
      var head  = document.getElementsByTagName('head')[0];
      var link  = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css?family=Press+Start+2P';
      head.appendChild(link);
      //Load the required image assets into the engine
      this.load.image('ship', 'game/assets/player1.png');
      this.load.image('otherShip', 'game/assets/player2.png');
      this.load.image('enemy', 'game/assets/enemy1.png');
      this.load.image('bullet', 'game/assets/bullet_player.png');
      this.load.image('enemyBullet', 'game/assets/bullet_enemy.png');
      this.load.image('background', 'game/assets/voyager_game_bg.png');
      this.load.image('stars1', "game/assets/voyager_game_stars1.png");
      this.load.image('stars2', "game/assets/voyager_game_stars2.png");
      this.load.image('enemyParticles', 'game/assets/enemy_particle.png');
      this.load.image('playerParticles', 'game/assets/player_particle.png');
      this.load.image('restartButton', 'game/assets/restart_btn.png');

      this.load.audio('playerShoot', 'game/assets/player_shoot.mp3');
      this.load.audio('playerDeath', 'game/assets/player_death.mp3');
      this.load.audio('enemyDeath', 'game/assets/enemy_death.mp3');
    }

    var bullets = null;
    var enemies = null;
    var otherBullets = null;
    var enemyBullets = null;
    // Create function for the Phaser engine
    function create() {
      
      var self = this;
      var add = this.add;
      var setScore = false;
      this.gameOver = false;
      addBackground(self);
      
      this.socket = socket;
      this.otherPlayers = this.physics.add.group();
      this.playerGroup = this.physics.add.group();

      this.playerShootSound = this.sound.add('playerShoot');
      this.playerDeathSound = this.sound.add('playerDeath');
      this.enemyDeathSound = this.sound.add('enemyDeath');

      this.socket.on('currentPlayers', function (players) {
          Object.keys(players).forEach(function (id) {
              if (players[id].playerId === self.socket.id) {
                  addPlayer(self, players[id]);
              } 
              else {
                  addOtherPlayers(self, players[id]);
              }
          });
      });

      this.socket.on('hostAssigned', function(hostPlayer) {
          self.otherPlayers.getChildren().forEach(function (otherPlayer) {
              if(otherPlayer.playerId === hostPlayer.playerId) {
                  otherPlayer.isHost = hostPlayer.isHost;
              }
              else if(hostPlayer.playerId === self.socket.id) {
                  isHost = true;
              }
          });
      })

      this.socket.on('newPlayer', function (playerInfo) {
          addOtherPlayers(self, playerInfo);
      });

      this.socket.on('disconnect', function(playerId) {
          self.otherPlayers.getChildren().forEach(function (otherPlayer) {
              if (playerId === otherPlayer.playerId) {
                  otherPlayer.destroy();
              }
          });
          Object.keys(gameManager.scoreTexts).forEach(function(key) {
            if(playerId === key) {
                gameManager.scoreTexts[key].destroy();
                delete gameManager.scoreTexts[key];
            }
          });
      });

      this.cursors = this.input.keyboard.createCursorKeys();
      fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      resetButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

      this.socket.on('playerMoved', function (playerInfo) {
          self.otherPlayers.getChildren().forEach(function (otherPlayer) {
              if (playerInfo.playerId === otherPlayer.playerId) {
                  otherPlayer.setPosition(playerInfo.x, playerInfo.y);
              }
          });
      });

      this.socket.on('scoreUpdate', function () {
          if(setScore) {
              self.currentRound.setText('Round: ' + gameManager.round);
              //self.localScore.setText(gameManager.players[self.socket.id].name + ": " + gameManager.players[self.socket.id].score);
                Object.keys(gameManager.scoreTexts).forEach(function(key) {
                    gameManager.scoreTexts[key].setText(gameManager.players[key].name + ": " + gameManager.players[key].score)
                });
            }
      });

      this.socket.on('playerFired', function(firePos) {
          if(isHost) {
              var bullet = bullets.get();
              if (bullet)
              {
                  bullet.playerId = firePos.playerId;
                  bullet.fire(firePos.x, firePos.y);
              }
          }
          else {
              var bullet = otherBullets.get();
              if (bullet)
              {
                  bullet.playerId = firePos.playerId;
                  bullet.fire(firePos.x, firePos.y);
              }
          }

      });

      this.socket.on('enemyFired', function(firePos){
        var bullet = enemyBullets.get();
        if(bullet) {
            bullet.fire(firePos.x, firePos.y);
        }
      });

      this.socket.on('hitEnemy', function(data){
          console.log("This is the 'hitEnemy' phaser event being executed on this client!");
          enemies.getChildren()[data.enemyId].hit(data.playerId);
      });

      this.socket.on('updateEnemyState', function(enemyData) {
          if(!isHost) {
              enemies.getChildren()[enemyData.id].setState(enemyData);
            //   var enemyArray = enemies.getChildren();

            //   enemyArray.forEach(function(enemy) {
            //       if(enemy.id === enemyData.id) {
            //           enemy.setState(enemyData);
            //       }
            //   });
          }

      });

      this.socket.on('updateGameManager', function(gameData) {
          gameManager.round = gameData.round;
          gameManager.enemiesOnScreen = gameData.enemiesOnScreen;
          gameManager.players = gameData.players;
          if(setScore) {
              self.currentRound.setText("Round: " + gameManager.round);
              Object.keys(gameManager.players).forEach(function(playerId){
                  if(playerId === self.socket.id){
                      //self.localScore.setText(gameManager.players[playerId].name + ": " + gameManager.players[self.socket.id].score);
                  }
                  else {
                      gameManager.scoreTexts[playerId].setText(gameManager.players[playerId].name + ": " + gameManager.players[playerId].score);
                  }
              });
              self.livesText.setText("Lives: " + gameManager.players[self.socket.id].lives);
          }
      });

      this.socket.on('hitPlayer', function(data){
        playerDeathEmitter.setPosition(data.x, config.height - 64);
        playerDeathEmitter.explode(15);
      });

      this.socket.on('killPlayer', function(player) {
          gameManager.players[player.id].lives = 0;
          gameManager.numOfDeadPlayers += 1;
      });

      this.socket.on('endGame', function() {
          gameOver(self);
      })

      this.socket.on('restartGame', function() {
        restartGame(self);
      });

      //Class creation for the Bullet class
      var Bullet = new Phaser.Class({
              
          Extends: Phaser.GameObjects.Image,

          initialize:

          function Bullet (scene){
              Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
              this.speed = Phaser.Math.GetSpeed(600, 1);
          },

          fire: function (x, y){
              this.setPosition(x, y);
              this.setActive(true);
              this.setVisible(true);
          },

          update: function (time, delta){
              this.y -= this.speed * delta;

              if (this.y < 0){
                  this.destroy();
              }
          }

      });
      //Class creation for the Bullet class
      var EnemyBullet = new Phaser.Class({
              
        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene){
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemyBullet');
            this.speed = Phaser.Math.GetSpeed(600, 1.5);
        },

        fire: function (x, y){
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta){
            this.y += this.speed * delta;

            if (this.y > config.height){
                this.destroy();
            }
        }

    });
      //Class creation for the Enemy class
      var Enemy = new Phaser.Class({

          Extends: Phaser.GameObjects.Image,

          initialize:

          function Enemy (scene){
              Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
              this.speed = 200;
              this.direction = 1;
              this.score = 10;
          },

          create: function (x, y){
              this.isAlive = false;
              this.setPosition(x, y);
              this.setActive(true);
              this.setVisible(true);
              this.firingTimer = self.time.now + (Math.random() * 2000) + 2000;
              this.setDisplaySize(99 / scale, 90 / scale);
              if(isHost && this.isAlive) {
                  //this.body.setVelocityX(this.speed * this.direction);            
              }
          },

          
          update: function (time, delta){
              if(isHost) {
                  if(this.isAlive) {
                      if(this.group[0].x > config.width - 50 || this.x > config.width - 50) {
                          this.direction = -1;
                          this.body.setVelocityX(this.speed * this.direction);
                      }
                      else if(this.group[0].x < 50 || this.x < 50) {
                          this.direction = 1;
                          this.body.setVelocityX(this.speed * this.direction);
                      }
      
                      if(this.body.velocity.x === 0 && this.body.velocity.y === 0) {
                          this.body.setVelocityX(this.speed * this.direction);
                      }
                      if(this.firingTimer <= time) {
                          this.shoot();
                      }
                      if(this.y >= this.targetY) {
                          this.body.setVelocityY(0);
                          this.body.setVelocityX(this.speed * this.direction);
                      }
                  }
                  else {
                      this.body.setVelocityX(0);
                      this.body.setVelocityY(0);
                  }
                  var state = {
                      id: this.id,
                      x: this.x,
                      y: this.y,
                      speed: this.speed,
                      row: this.row,
                      direction: this.direction,
                      isAlive: this.isAlive
                  }
                  self.socket.emit('enemyState', state);
              }

          },

          hit: function(playerId) {
            enemyDeathEmitter.setPosition(this.x, this.y);
            enemyDeathEmitter.explode(15);
            self.enemyDeathSound.play();
              if(isHost) {
                  this.isAlive = false;
                  this.setPosition(400, -100);
                  console.log("Enemy hit.  Value of this.group before splice:");
                  console.log(this.group);
                  this.group.splice(this.group.indexOf(this), 1);
                  console.log("After splice:");
                  console.log(this.group);
                  console.log("playerId in this function's scope:");
                  console.log(playerId);
                  gameManager.enemies.dead[this.row].push(this);
                  if(this.group.length <= 0 && gameManager.spawnedRows !== gameManager.round) {
                      spawnRow(this.row);
                  }
                  gameManager.enemiesOnScreen = gameManager.enemiesOnScreen - 1;
              }
              gameManager.players[playerId].score += this.score;
              //console.log(gameManager.scoreTexts);
              if(playerId === self.socket.id){
                  //self.localScore.setText(gameManager.players[playerId].name + ": " + gameManager.players[playerId].score);
              }
              else {
                  gameManager.scoreTexts[playerId].setText(gameManager.players[playerId].name + ": " + gameManager.players[playerId].score);
              }
            
          },

          setState: function(data) {
              if(data.speed) {
                  this.speed = data.speed;
              }
              if(data.x) {
                  this.x = data.x;
              }
              if(data.y){
                  this.y = data.y;
              }
              if(data.id) {
                  this.id = data.id;
              }
              if(data.direction) {
                  this.direction = data.direction;
              }
              if(data.row) {
                  this.row = data.row;
              }
              if(data.isAlive) {
                  this.isAlive = data.isAlive;
              }
          },

          shoot: function() {
              var bullet = enemyBullets.get();
              if(bullet) {
                  bullet.fire(this.x, this.y);
              }
              this.firingTimer = self.time.now + ((Math.random()) * 4000) + 3000;
              self.socket.emit('enemyShoot', {x: this.x, y: this.y, enemyId: this.id});
          },

          spawn: function(targetY) {
              this.firingTimer = self.time.now + ((Math.random() + 0.1) * 3000) + 3000;
              this.targetY = targetY;
              this.body.setVelocityY(this.speed);
          },
          
          clear: function() {
            if(isHost) {
                this.isAlive = false;
                this.setPosition(400, -100);
                this.group.splice(this.group.indexOf(this), 1);
                gameManager.enemies.dead[this.row].push(this);
                gameManager.enemiesOnScreen = 0;
                this.body.setVelocityX(0);
                this.body.setVelocityY(0);
            }
          }

      });
      //Create the bullets group
      bullets = this.physics.add.group({
          classType: Bullet,
          maxSize: 60,
          runChildUpdate: true
      });

      otherBullets = this.physics.add.group({
          classType: Bullet,
          maxSize: 60,
          runChildUpdate: true
      });

      enemyBullets = this.physics.add.group({
          classType: EnemyBullet,
          maxSize: 60,
          runChildUpdate: true
      });

      //Create the enemies group
      enemies = this.physics.add.group({
          classType: Enemy,
          runChildUpdate: true,
          maxSize: 36
      });

      //Add the overlap listener for the bullets and enemies
      this.physics.add.overlap(bullets, enemies, enemyHit);
      this.physics.add.overlap(otherBullets, enemies, function(bullet, enemy) {
          bullet.destroy();
      });
      this.physics.add.overlap(enemyBullets, self.playerGroup, playerHit);
      this.physics.add.overlap(enemyBullets, bullets, function(enemyBullet, bullet) {
          bulletCollision.setPosition(enemyBullet.x, enemyBullet.y);
          bulletCollision.explode(10);
          bullet.destroy();
          enemyBullet.destroy();
      });
      this.physics.add.overlap(enemyBullets, otherBullets, function(enemyBullet, bullet) {
        bullet.destroy();
        enemyBullet.destroy();
    });
      
      //The function called when the local player hits an enemy
      function enemyHit(bullet, enemy) {
          //console.log(bullet.playerId);
          bullet.destroy();
          self.socket.emit('enemyHit', { enemyId: enemy.id, playerId: bullet.playerId });
          //self.socket.emit('enemyState', {id: this.id, kill: true});
          console.log("Here is the enemyHit function being executed on this client!");
          enemy.hit(bullet.playerId);
      };

    function playerHit(enemyBullet, player) {
        var gmPlayer = gameManager.players[player.playerId];
        if(gmPlayer.isAlive) {
            playerDeathEmitter.setPosition(player.x, config.height - 64);
            playerDeathEmitter.explode(15);
            self.playerDeathSound.play();
            self.socket.emit('playerHit', { x: player.x, y: player.y });
        }
        enemyBullet.destroy();            
        if(gmPlayer.lives > 0 && gmPlayer.isAlive) {
            player.setPosition(config.width / 2, config.height + 100);
            gmPlayer.isAlive = false;
            gmPlayer.lives -= 1;
            if(player.playerId === self.socket.id) {
                self.livesText.setText("Lives: " + gmPlayer.lives);
                if(gmPlayer.lives <= 0) {
                    killPlayer(player);
                    self.socket.emit('playerKilled', { id: player.playerId });
                }
                else {
                    respawnPlayer(player);
                }
            }
        }
    }

    createEnemies(enemies);

    self.currentRound = add.text(16, 16, 'Round: 1', { fontSize: '16px', fill: '#ffffff', fontFamily: '\'Press Start 2P\', serif'});
    self.gameOverText = add.text(115, config.height / 3, 'GAME OVER', {fontSize: "64px", fill: "#ffffff", fontFamily: '\'Press Start 2P\', serif', align: 'center'}).setVisible(false);
    
    
    self.restartButton = self.add.sprite(config.width / 2, 330, 'restartButton').setDisplaySize(400, 100).setDepth(1).setVisible(false);
    self.restartButton.setInteractive({ useHandCursor: true });
    self.restartButton.on('pointerover', () => {
          self.restartButton.setPosition(config.width / 2, 335);
    });
      self.restartButton.on('pointerout', () => {
        self.restartButton.setPosition(config.width / 2, 330);
    });
    self.restartButton.on('pointerdown', () => {
        restartGame(self);
    });
    
      setScore = true;

    var enemyDeathEmitter = this.add.particles('enemyParticles').createEmitter({
        x: -400,
        y: 300,
        speed: { min: -150, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        //active: false,
        lifespan: 400,
    });
    var playerDeathEmitter = this.add.particles('playerParticles').createEmitter({
        x: -400,
        y: 300,
        speed: { min: -200, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        //active: false,
        lifespan: 500,
    });
    var bulletCollision = this.add.particles('enemyParticles').createEmitter({
        x: -400,
        y: 300,
        speed: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.4, end: 0 },
        blendMode: 'SCREEN',
        //active: false,
        lifespan: 400,
    });
    // === End of the create() function ===
    }

    var playerSpeed = 6;

    function update() {
      var self = this;
      //Player controls including movement and firing
      if (this.ship) {
          if(gameManager.players[self.socket.id].isAlive){
             if (this.cursors.left.isDown && this.ship.x > 50) {
                this.ship.x = this.ship.x - playerSpeed;
            } 
            else if (this.cursors.right.isDown && this.ship.x < config.width - 50) {
                this.ship.x = this.ship.x + playerSpeed;
            } 
            //The player fires when they press the fire button, currently the 'space bar'
            if (Phaser.Input.Keyboard.JustDown(fireButton))
            {
                this.playerShootSound.play();
                //console.log(gameManager);
                if(isHost) {
                    
                    var bullet = bullets.get();
                    if (bullet)
                    {
                        bullet.fire(this.ship.x, this.ship.y);
                        bullet.playerId = this.socket.id;
                        var bulletLoc = {
                            x: this.ship.x,
                            y: this.ship.y,
                            playerId: bullet.playerId
                        }
                        this.socket.emit('playerFire', bulletLoc);
                    }
                }
                else {
                    var bullet = otherBullets.get();
                    if (bullet)
                    {
                        bullet.fire(this.ship.x, this.ship.y);
                        bullet.playerId = this.socket.id;
                        var bulletLoc = {
                            x: this.ship.x,
                            y: this.ship.y,
                            playerId: bullet.playerId
                        }
                        this.socket.emit('playerFire', bulletLoc);
                    }
                }

            } 
          }
          else {
              if(this.ship.y <= this.ship.targetY) {
                  this.ship.body.setVelocityY(0);
                  gameManager.players[self.socket.id].isAlive = true;
              }
          }
            
          
          // emit player movement
          var x = this.ship.x;
          var y = this.ship.y;
          if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y)) {
              this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, isHost: isHost});
          }

          // save old position data
          this.ship.oldPosition = {
              x: this.ship.x,
              y: this.ship.y,
          };

      }
      //Basic game logic for spawning an increasing number of enemies, only on the host side
      if(isHost) {
        if(gameManager.started && gameManager.enemiesOnScreen <= 0 && gameManager.spawnedRows === gameManager.round) {
            gameManager.round++;
            newRound(gameManager.round);
            self.currentRound.setText("Round: " + gameManager.round);
            this.socket.emit('changeGameManager', gameManager);
        }
        if(!gameManager.started && !self.gameOver) {
            console.log("Starting game");
            gameManager.started = true;
            newRound(gameManager.round); 
        }
        if(Object.keys(gameManager.players).length !== 0 && gameManager.numOfDeadPlayers >= Object.keys(gameManager.players).length) {
            gameOver(self);
            self.socket.emit('gameOver');
        }
      }

      this.stars1.tilePositionY -= 2;
      this.stars2.tilePositionY -= 4;
      

    // === End of the update() function ===
    }

    //Creates the pool of enemies that will be manipulated and places them offscreen
    function createEnemies(enemies) {
      for(var i = 0; i < enemies.maxSize; i++) {
          var enemy = enemies.get();
          if(enemy) {
              enemy.id = i;
              enemy.direction = 1;
              enemy.speed = 200;
              if(i <= 5) {
                  enemy.row = "row1";
                  enemy.group = gameManager.enemies.row1;
                  gameManager.enemies.row1.push(enemy)
              }
              else if(i <= 11) {
                  enemy.row = "row2";
                  enemy.group = gameManager.enemies.row2;
                  gameManager.enemies.row2.push(enemy)
              }
              else if(i <= 17) {
                  enemy.row = "row3";
                  enemy.group = gameManager.enemies.row3;
                  gameManager.enemies.row3.push(enemy)
              }
              else if(i <= 23) {
                  enemy.row = "row4";
                  enemy.group = gameManager.enemies.row4;
                  gameManager.enemies.row4.push(enemy)
              }
              else if(i <= 29) {
                  enemy.row = "row5";
                  enemy.group = gameManager.enemies.row5;
                  gameManager.enemies.row5.push(enemy)
              }
              else {
                  enemy.row = "row6";
                  enemy.group = gameManager.enemies.row6;
                  gameManager.enemies.row6.push(enemy)
              }
              //gameManager.enemies.dead.push(enemy);
              enemy.create(400, -100);
          }
      }

      console.log(gameManager.enemies);
    }

    //Spawns the given row of enemies, will be adjusted to come in from the top instead of appearing at their position when possible
    function spawnRow(row) {
      console.log(row);
      var height;
      switch(row) {
          case "row1":
              height = 100;
              break;
          case "row2":
              height = 150;
              break;
          case "row3":
              height = 200;
              break;
          case "row4":
              height = 250;
              break;
          case "row5":
              height = 300;
              break;
          case "row6":
              height = 350;
              break;
          default:
              height = 100;
      }
      if(gameManager.enemies[row].length <= 0) {
          console.log(gameManager.enemies.dead);
          for(var i = 0; i < 6; i++) {
              var enemy = gameManager.enemies.dead[row].pop();
              gameManager.enemies["" + row].push(enemy);
              enemy.setPosition(75 + (50 * i), -height);
              enemy.isAlive = true;
              enemy.direction = 1;
              enemy.spawn(height);
              if(isHost) {
                  enemy.body.setVelocityX(enemy.direction * enemy.speed);
                  enemy.body.setVelocityY(enemy.speed);
              }        
              gameManager.enemiesOnScreen = gameManager.enemiesOnScreen + 1;
          }
      }
      else{
          gameManager.enemies[row].forEach(function(enemy, index) {
              enemy.setPosition(75 + (50 * index), -height);
              enemy.isAlive = true;
              enemy.direction = 1;
              enemy.spawn(height);
              if(isHost) {
                  enemy.body.setVelocityX(enemy.direction * enemy.speed);
                  enemy.body.setVelocityY(enemy.speed);
              }
              gameManager.enemiesOnScreen = gameManager.enemiesOnScreen + 1;
          });
      }
      gameManager.spawnedRows++;

    }

    //Starts the next round
    function newRound(round, game) {
      console.log(round);
      gameManager.spawnedRows = 0;
      var rowsToSpawn;
      if(round > 6) {
          rowsToSpawn = 6;
      }
      else {
          rowsToSpawn = round;
      }
      for(var i = 1; i <= rowsToSpawn; i++) {
          spawnRow("row" + i);
      }
    }

    function gameOver(game) {
        game.gameOver = true;
        gameManager.started = false;
        game.gameOverText.setVisible(true);
        if(isHost) {
            game.restartButton.setActive(true);
            game.restartButton.setVisible(true);   
        }
       
    }

    function killPlayer(player) {
        gameManager.players[player.playerId].lives = 0;
        gameManager.numOfDeadPlayers += 1;
    }

    function respawnPlayer(player) {
        console.log("Respawning this one: ");
        console.log(gameManager.players);
        player.targetY = config.height - 64;
        player.setVelocityY(-150);
    }

    function restartGame(game) {
        if(isHost) {
            game.socket.emit('restartGame');
        }
        console.log("RESET ME");
        gameManager.round = 1;
        gameManager.spawnedRows = 0;
        gameManager.numOfDeadPlayers = 0;
        game.currentRound.setText("Round: " + gameManager.round);
        Object.keys(gameManager.players).forEach(function(key) {
            gameManager.players[key].score = 0;
            gameManager.players[key].lives = 3;
        });
        game.livesText.setText("Lives: " + gameManager.players[game.socket.id].lives)
        //game.localScore.setText(gameManager.players[game.socket.id].name + ": " + gameManager.players[game.socket.id].score);
        Object.keys(gameManager.scoreTexts).forEach(function(key) {
            gameManager.scoreTexts[key].setText(gameManager.players[key].name + ": " + gameManager.players[key].score);
        });
        enemies.getChildren().forEach(function(enemy) {
            enemy.clear();
        });
        game.gameOverText.setVisible(false);
        game.gameOver = false;
        gameManager.players[game.socket.id].isAlive = true;
        game.ship.setPosition(config.width / 2, config.height - 64);
        enemyBullets.clear(true, true);
        game.restartButton.setActive(false);
        game.restartButton.setVisible(false);  
    }

    function addBackground(game) {
        game.background = game.add.tileSprite(400, 300, 800, 600, 'background').setDepth(-3);
        game.stars1 = game.add.tileSprite(400, 300, 800, 600, 'stars1').setDepth(-2);
        game.stars2 = game.add.tileSprite(400, 300, 800, 600, 'stars2').setDepth(-1);
    }

    function addPlayer(self, playerInfo) {
      if(playerInfo.isHost) {
          isHost = true;
      }

      if(!Object.keys(gameManager.players).includes(playerInfo.playerId)) {
        self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(135 / scale, 90 / scale);
        self.ship.setDepth(1);
        self.ship.playerId = self.socket.id;
        var playerNum = (Object.keys(gameManager.players).length + 1);
        gameManager.players[self.socket.id] = { score: 0, name: "Player " + playerNum, lives: 3, isAlive: true};
        self.playerGroup.add(self.ship);
        self.localScore = self.add.text(16, 48, gameManager.players[self.socket.id].name + ": 0", { fontSize: '16px', fill: '#f1632e', fontFamily: '\'Press Start 2P\', serif' });
        self.livesText = self.add.text(config.width - 140, 16, 'Lives: 3', {fontSize: "16px", fill: "#ffffff", fontFamily: '\'Press Start 2P\', serif', align: 'right'});
      }
    }

    function addOtherPlayers(self, playerInfo) {
      if(!Object.keys(gameManager.players).includes(playerInfo.playerId)) {
        const otherPlayer = self.physics.add.image(playerInfo.x, playerInfo.y, 'otherShip').setOrigin(0.5, 0.5).setDisplaySize(135 / scale, 90 / scale);
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
        self.playerGroup.add(otherPlayer);
        var playerNum = (Object.keys(gameManager.players).length + 1);
        gameManager.players[otherPlayer.playerId] = { score: 0, name: "Player " + playerNum, lives: 3, isAlive: true };
        gameManager.scoreTexts[otherPlayer.playerId] = self.add.text(16, 64 + (16 * Object.keys(gameManager.scoreTexts).length),gameManager.players[otherPlayer.playerId].name + ": 0", { fontSize: '16px', fill: '#f1632e', fontFamily: '\'Press Start 2P\', serif' });
        if(isHost) {
            self.socket.emit('changeGameManager', gameManager);
        }
      }
    }
  }

  shouldComponentUpdate() {
    return false;
  }
  render() {
    return (
      <div className="phaser-div">
        <div id="phaser-game"></div>
        <Nav />
      </div>
      
    );
  }
}

export default Game;