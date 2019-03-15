var config = {
    type: Phaser.AUTO,
    parent: 'voyager',
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
        update: update,
    } 
};

// var socketGlobal = io();

var game = new Phaser.Game(config);
var fireButton;
var bullets;
var isHost = false;

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
    
    //this.currentHost = this.add.text(16, 16, '', { fontSize: '32px', fill: '#ffffff' });
    //this.playerId = this.add.text(16, 48, '', { fontSize: '32px', fill: '#FF0000' });
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
            self.currentHost = add.text(16, 16, '', { fontSize: '32px', fill: '#ffffff', fontFamily: 'Share Tech'});
            self.playerId = add.text(16, 48, '', { fontSize: '32px', fill: '#FF0000', fontFamily: 'Share Tech' });
            self.socket.emit('fontsLoaded');
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
            self.currentHost.setText('Host: ' + scores.host);
            self.playerId.setText('My Id: ' + self.socket.id);
        }
    });

    this.socket.on('playerFired', function(firePos) {
        if(isHost) {
            var bullet = bullets.get();
            if (bullet)
            {
                bullet.fire(firePos.x, firePos.y);
            }
        }
        else {
            var bullet = otherBullets.get();
            if (bullet)
            {
                bullet.fire(firePos.x, firePos.y);
            }
        }

    });

    this.socket.on('hitEnemy', function(data){
        enemies.getChildren().forEach(function(enemy) {
            if(enemy.id === data.enemyId) {
                enemy.hit(data.newEnemyX, 100);
            }
        })
    })

    this.socket.on('updateEnemyState', function(enemyData) {
        var enemiesArray = enemies.getChildren();
        Object.keys(enemyData).forEach(function(key, index) {
            enemiesArray[index].setState(enemyData[key]);

        })
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
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });
    //Class creation for the Enemy class
    var Enemy = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Enemy (scene){
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
            this.id = enemies.getChildren().length;
            this.travelTime = 3;
            this.speed = Phaser.Math.GetSpeed(800, this.travelTime);
            this.direction = 1;
        },

        create: function (x, y){
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta){
            if(isHost) {
                this.x += this.speed * delta * this.direction;

                if(this.x > config.width - 50) {
                    this.direction = -1;
                }
                else if(this.x < 50) {
                    this.direction = 1;
                }
            }

        },

        hit: function(x, y, bullet, enemy) {
            this.setPosition(x, y);
        },

        setState: function(data) {
            this.x = data.x;
            this.y = data.y;
            this.direction = data.direction;
            this.travelTime = data.travelTime;
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
        maxSize: 10,
        runChildUpdate: true
    });


    for(var i = 0; i < 10; i++) {
        var enemy = enemies.get();

        if (enemy){
            enemy.create(config.width / 2, 60 + (50 * i));
            enemy.setDisplaySize(99 / 2, 90 / 2);
        }
    }
    //Create an enemy, currently used for debugging enemy movement pre-behavior implementation   

    //Add the overlap listener for the bullets and enemies
    this.physics.add.overlap(bullets, enemies, enemyHit);
    this.physics.add.overlap(otherBullets, enemies, function(bullet, enemy) {
        bullet.setPosition(-100, -100);
        bullets.killAndHide(bullet);
    });
    
    //The function called when the local player hits an enemy
    function enemyHit(bullet, enemy) {
        bullet.setPosition(-100, -100);
        bullets.killAndHide(bullet);
        var newEnemyX = Math.floor(Math.random() * (config.width - 100)) + 50;
        self.socket.emit('enemyHit', { enemyId: enemy.id, newEnemyX: newEnemyX});
        enemy.hit(newEnemyX, enemy.y);
    };


// === End of the create() function ===
}



var playerSpeed = 4;

function update() {
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

            if(isHost) {
                var bullet = bullets.get();
                if (bullet)
                {
                    bullet.fire(this.ship.x, this.ship.y);
                    var bulletLoc = {
                        x: this.ship.x,
                        y: this.ship.y
                    }
                    this.socket.emit('playerFire', bulletLoc);
                }
            }
            else {
                var bullet = otherBullets.get();
                if (bullet)
                {
                    bullet.fire(this.ship.x, this.ship.y);
                    var bulletLoc = {
                        x: this.ship.x,
                        y: this.ship.y
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

    if(isHost) {
        var enemyData = {};
        enemies.getChildren().forEach(function(enemy) {
            enemyData[enemy.id] = {
                x: enemy.x,
                y: enemy.y,
                direction: enemy.direction,
                travelTime: enemy.travelTime
            }
        });
        this.socket.emit('enemyState', enemyData);
    }

// === End of the update() function ===
}



function addPlayer(self, playerInfo) {
    if(playerInfo.isHost) {
        isHost = true;
    }
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(135 / 2, 90 / 2);
    self.ship.setDepth(1);

}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherShip').setOrigin(0.5, 0.5).setDisplaySize(135 / 2, 90 / 2);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}
