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

var game = new Phaser.Game(config);
var fireButton;
var bullets;
var isHost = false;
var enemyData = {};

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
        enemies.getChildren()[data.id].hit();
    });

    this.socket.on('updateEnemyState', function(enemyData) {
        var enemyArray = enemies.getChildren();
        this.enemyData = enemyData;

        if(enemyArray.length > 0) {
            Object.keys(enemyData).forEach(function(key) {
                enemyArray[key].setState(enemyData[key]);
            });
        }

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
            //this.speed = Phaser.Math.GetSpeed(800, this.travelTime);
            this.speed = 200;
            this.direction = 1;
            this.group;
        },

        create: function (x, y){
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta){
            if(this.group.getChildren()[enemies.getChildren().length - 1].x > config.width - 50) {
                this.group.setVelocityX(this.speed * -1);
            }
            else if(this.group.getChildren()[0].x < 50) {
                this.group.setVelocityX(this.speed);
            }

            if(isHost) {
                var state = {
                    id: this.id,
                    x: this.x,
                    y: this.y,
                    speed: this.speed
                }
                self.socket.emit('enemyState', state);
            }

        },

        hit: function(x, y, bullet, enemy) {
            self.socket.emit('enemyState', {id: this.id, kill: true});
            this.destroy();

            if(enemies.length <= 0) {
                for(var i = 0; i < 5; i++) {
                    var enemy = enemies.get();
            
                    if (enemy){
                        enemy.create(75 + (75 * i), 60 );
                        enemy.setDisplaySize(99 / 2, 90 / 2);
                    }
                }
                enemies.setVelocityX(200);
            }

        },

        setState: function(data) {
            console.log(data);
            if(this.id === data.id) {
                if(data.speed) {
                    this.speed = data.speed;
                }
                if(data.x) {
                    this.x = data.x;
                }
                else {
                    this.x += this.speed * this.direction;
                }
                if(data.y){
                    this.y = data.y;
                }
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

    //Create the enemies group
    enemies = this.physics.add.group({
        classType: Enemy,
        runChildUpdate: true,
        maxSize: 10
    });



    //Add the overlap listener for the bullets and enemies
    this.physics.add.overlap(bullets, enemies, enemyHit);
    this.physics.add.overlap(otherBullets, enemies, function(bullet, enemy) {
        bullets.killAndHide(bullet);
        bullet.setPosition(-100, -100);
    });
    
    //The function called when the local player hits an enemy
    function enemyHit(bullet, enemy) {
        bullets.killAndHide(bullet);
        bullet.setPosition(-100, -100);
        self.socket.emit('enemyHit', { enemyId: enemy.id, newX: newEnemyX});
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

    // if(isHost) {
    //     var enemyData = {};
    //     enemies.getChildren().forEach(function(enemy) {
    //         enemyData[enemy.id] = {
    //             x: enemy.x,
    //             y: enemy.y,
    //             direction: enemy.direction,
    //             travelTime: enemy.travelTime
    //         }
    //     });
    //     this.socket.emit('enemyState', enemyData);
    // }



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
