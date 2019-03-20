
var config = {
    type: Phaser.AUTO,
    parent: 'voyager',
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
var bullets;
var isHost = false;
var enemyData = {};
var scale = 2.5;

var gameManager = {
    round: 1,
    spawnedRows: 0,
    //Scores are held here under the player socket ID
    players: {},
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

    //Load the required image assets into the engine
    this.load.image('ship', 'assets/player1.png');
    this.load.image('otherShip', 'assets/player2.png');
    this.load.image('enemy', 'assets/enemy1.png');
    this.load.image('bullet', 'assets/bullet_player.png');
}

// Create function for the Phaser engine
function create() {
    
    var self = this;
    var add = this.add;
    var setScore = false;

    
    
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    WebFont.load({
        google: {
            families: [ 'Share Tech' ]
        },
        active: function ()
        {
            self.currentRound = add.text(16, 16, 'Round: 1', { fontSize: '32px', fill: '#ffffff', fontFamily: 'Share Tech'});
            self.localScore = add.text(16, 48, self.socket.id + ': 0', { fontSize: '32px', fill: '#FF0000', fontFamily: 'Share Tech' });
            //self.socket.emit('fontsLoaded');
            setScore = true;
        }
    });
    

    this.socket.on('currentPlayers', function (players) {
        console.log("Players: " + Object.keys(players).length);

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

    });

    this.cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    this.socket.on('scoreUpdate', function (scores) {
        if(setScore) {
            self.currentRound.setText('Round: ' + gameManager.round);
            self.localScore.setText("" + self.socket.id + ": " + gameManager.players[self.socket.id].score);
        }
    });

    this.socket.on('playerFired', function(firePos) {
        console.log(firePos);
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

    this.socket.on('hitEnemy', function(data){
        enemies.getChildren()[data.enemyId].hit(data.playerId);
    });

    this.socket.on('updateEnemyState', function(enemyData) {
        if(!isHost) {
            var enemyArray = enemies.getChildren();

            enemyArray.forEach(function(enemy) {
                if(enemy.id === enemyData.id) {
                    enemy.setState(enemyData);
                }
            });
        }

    });

    this.socket.on('updateGameManager', function(gameData) {
        console.log(gameData);
        gameManager.round = gameData.round;
        gameManager.enemiesOnScreen = gameData.enemiesOnScreen;
        gameManager.players = gameData.players;
        if(setScore) {
            self.currentRound.setText("Round: " + gameManager.round);
            Object.keys(gameManager.players).forEach(function(playerId){
                if(playerId === self.socket.id){
                    self.localScore.setText("" + self.socket.id + ": " + gameManager.players[self.socket.id].score);
                }
                else {
                    gameManager.scoreTexts[playerId].setText(playerId + ": " + gameManager.players[playerId].score);
                }
            })
        }
    })

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
    //Class creation for the Enemy class
    var Enemy = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Enemy (scene){
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
            this.id;
            this.speed = 200;
            this.direction = 1;
            this.row;
            this.score = 10;
        },

        create: function (x, y){
            this.isAlive = false;
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
            this.firingTimer = self.time.now + 2000;
            this.setDisplaySize(99 / scale, 90 / scale);
            if(isHost && this.isAlive) {
                this.body.setVelocityX(this.speed * this.direction);            
            }
        },

        
        update: function (time, delta){
            if(isHost) {
                if(this.isAlive) {
                    if(this.group[this.group.length - 1].x > config.width - 50 || this.x > config.width - 50) {
                        this.direction = -1;
                        this.body.setVelocityX(this.speed * this.direction);
                    }
                    else if(this.group[0].x < 50 || this.x < 50) {
                        this.direction = 1;
                        this.body.setVelocityX(this.speed * this.direction);
                    }
    
                    if(this.body.velocity.x === 0) {
                        this.body.setVelocityX(this.speed * this.direction);
                    }
                    if(this.firingTimer <= time) {
                        this.shoot();
                    }
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
            if(isHost) {
                this.isAlive = false;
                this.setPosition(400, -100);
                this.group.splice(this.group.indexOf(this), 1);
                gameManager.enemies.dead[this.row].push(this);
                if(this.group.length <= 0 && gameManager.spawnedRows !== gameManager.round) {
                    spawnRow(this.row);
                }
                gameManager.enemiesOnScreen = gameManager.enemiesOnScreen - 1;
            }
            gameManager.players[playerId].score += this.score;
            console.log(gameManager.scoreTexts);
            if(playerId === self.socket.id){
                self.localScore.setText("" + self.socket.id + ": " + gameManager.players[self.socket.id].score);
            }
            else {
                gameManager.scoreTexts[playerId].setText(playerId + ": " + gameManager.players[playerId].score);
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
            console.log(this.id + " is shootsting");
            this.firingTimer = self.time.now + (Math.random() * 2000) + 1000;
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
    
    //The function called when the local player hits an enemy
    function enemyHit(bullet, enemy) {
        console.log(bullet.playerId);
        bullet.destroy();
        self.socket.emit('enemyHit', { enemyId: enemy.id, playerId: bullet.playerId });
        //self.socket.emit('enemyState', {id: this.id, kill: true});
        enemy.hit(bullet.playerId);
    };

    createEnemies(enemies);
// === End of the create() function ===
}

var playerSpeed = 4;

function update() {
    var self = this;
    //Player controls including movement and firing
    if (this.ship) {
        if (this.cursors.left.isDown && this.ship.x > 50) {
            this.ship.x = this.ship.x - playerSpeed;
        } 
        else if (this.cursors.right.isDown && this.ship.x < config.width - 50) {
            this.ship.x = this.ship.x + playerSpeed;
        } 
        //The player fires when they press the fire button, currently the 'space bar'
        if (Phaser.Input.Keyboard.JustDown(fireButton))
        {
            console.log(gameManager);
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
        if(!gameManager.started) {
            console.log("Starting game");
            gameManager.started = true;
            newRound(gameManager.round); 
        }
    }

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
            enemy.setPosition(75 + (50 * i), height);
            enemy.isAlive = true;
            enemy.direction = 1;
            if(isHost) {
                enemy.body.setVelocityX(enemy.direction * enemy.speed);
            }        
            gameManager.enemiesOnScreen = gameManager.enemiesOnScreen + 1;
        }
    }
    else{
        gameManager.enemies[row].forEach(function(enemy, index) {
            enemy.setPosition(75 + (50 * index), height);
            enemy.isAlive = true;
            enemy.direction = 1;
            if(isHost) {
                enemy.body.setVelocityX(enemy.direction * enemy.speed);
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


// function spawnAtLocation(type, enemyData, game) {
//     var enemy = type.get(); 
//     if(enemy) {
//         //enemy.setState(enemyData);
//         enemy.row = enemyData.row;
//         enemy.group = gameManager.enemies[enemyData.row];
//         enemy.direction = enemyData.direction;
//         gameManager.enemies[enemyData.row].push(enemy);
//         enemy.create(enemyData.x, enemyData.y);
//     }
// }

function addPlayer(self, playerInfo) {
    if(playerInfo.isHost) {
        isHost = true;
    }
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(135 / scale, 90 / scale);
    self.ship.setDepth(1);
    gameManager.players[self.socket.id] = { score: 0 };
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.image(playerInfo.x, playerInfo.y, 'otherShip').setOrigin(0.5, 0.5).setDisplaySize(135 / scale, 90 / scale);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
    gameManager.players[otherPlayer.playerId] = { score: 0 };
    gameManager.scoreTexts[otherPlayer.playerId] = self.add.text(16, 72 + (24 * Object.keys(gameManager.scoreTexts).length), otherPlayer.playerId + ": 0", { fontSize: '32px', fill: '#FF0000', fontFamily: 'Share Tech' });
    if(isHost) {
        self.socket.emit('changeGameManager', gameManager);
    }
}
