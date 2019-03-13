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

function preload() {
    this.load.image('ship', 'assets/player1.png');
    this.load.image('otherShip', 'assets/player2.png');
    this.load.image('enemy', 'assets/enemy1.png');
    this.load.image('star', 'assets/star_gold.png');
}

function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    this.socket.on('currentPlayers', function (players) {
        console.log("Players: " + Object.keys(players).length);

        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
                if(Object.keys(players).length <= 1) {
                    isHost = true;
                    self.socket.emit('assignHost', {isHost: true});
                }
            } 
            else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on('hostAssigned', function(hostData) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            console.log(hostData);
        });
    })

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnect', function(playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
                if(self.otherPlayers.getChildren().length <= 0) {
                    isHost = true;
                    self.socket.emit('assignHost', {isHost: true});
                }
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

    this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#ffffff' });
    this.redScoreText = this.add.text(16, 48, '', { fontSize: '32px', fill: '#FF0000' });

    this.socket.on('scoreUpdate', function (scores) {
        self.blueScoreText.setText('Host: ' + scores.host);
        self.redScoreText.setText('My Id: ' + self.socket.id);
    });

    this.socket.on('playerFired', function(firePos) {
        var bullet = otherBullets.get();
        if (bullet)
        {
            bullet.fire(firePos.x, firePos.y);
        }
    });

    this.socket.on('hitEnemy', function(data){
        console.log("Hit an enemy");
        enemies.getChildren().forEach(function(enemy) {
            if(enemy.id === data.enemyId) {
                enemy.hit(data.newEnemyX, 100);
            }
        })
    })

    //Class creation for the Bullet class
    var Bullet = new Phaser.Class({
            
        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene){
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'star');
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
            this.speed = Phaser.Math.GetSpeed(600, this.travelTime);
            this.direction = 1;
        },

        create: function (x, y){
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta){
            this.x += this.speed * delta * this.direction;

            if(this.x > config.width - 50) {
                this.direction = -1;
            }
            else if(this.x < 50) {
                this.direction = 1;
            }
        },

        hit: function(x, y, bullet, enemy) {
            this.setPosition(x, y);
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
        maxSize: 1,
        runChildUpdate: true
    });

    var enemy = enemies.get();

    if (enemy){
        enemy.create(config.width / 2, 100);
    }
    //Add the overlap listener for the bullets and enemies
    this.physics.add.overlap(bullets, enemies, enemyHit);
    this.physics.add.overlap(otherBullets, enemies, function(bullet, enemy) {
        bullet.setPosition(-100, -100);
        bullets.killAndHide(bullet);
    });
    
    function enemyHit(bullet, enemy) {
        bullet.setPosition(-100, -100);
        bullets.killAndHide(bullet);
        var newEnemyX = Math.floor(Math.random() * (config.width - 100)) + 50;
        self.socket.emit('enemyHit', { enemyId: enemy.id, newEnemyX: newEnemyX});
        enemy.hit(newEnemyX, 100);
    };


// === End of the create() function ===
}



var playerSpeed = 4;

function update() {

    if (this.ship) {
        if (this.cursors.left.isDown && this.ship.x > 50) {
            this.ship.x = this.ship.x - playerSpeed;
        } 
        else if (this.cursors.right.isDown && this.ship.x < config.width - 50) {
            this.ship.x = this.ship.x + playerSpeed;
        } 

        if (Phaser.Input.Keyboard.JustDown(fireButton))
        {
            console.log(isHost);
            var bullet = bullets.get();
            if (bullet)
            {
                bullet.fire(this.ship.x, this.ship.y);
                //console.log("Trying to emit the firePos");
                var bulletLoc = {
                    x: this.ship.x,
                    y: this.ship.y
                }
                this.socket.emit('playerFire', bulletLoc);
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

// === End of the update() function ===
}

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(64, 64);
    self.ship.setDepth(1);

}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherShip').setOrigin(0.5, 0.5).setDisplaySize(64, 64);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

// function enemyHit() {
//   socket.broadcast.emit('enemyHit');
//   console.log("Hit");
//   socket.on("enemyHit", function() {
//     console.log("Hit");
//   });
// };

