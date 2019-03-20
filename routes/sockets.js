//var game_config = require("../public/game_config.json");
var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
var scores = {
  scores: [],
  host: "no one"
};
// Array of game objects to hold various game states and game IDs.

var enemyStates = {};

var sockets = function(socket, io) {
    console.log('a user connected');
    // add player at x/y coordinates specified based on game_config values in phaser.
    players[socket.id].x = game_config.width / 2;
    players[socket.id].y = game_config.height - 64;
  
    if(Object.keys(players).length === 1) {
      players[socket.id].isHost = true;
      scores.host = socket.id;
    }
  
    // send the players object to the new player
    io.in(players[socket.id].roomId).emit('currentPlayers', players);
    // send the star object to the new player
    io.in(players[socket.id].roomId).emit('starLocation', star);
    // send the current scores
    io.in(players[socket.id].roomId).emit('scoreUpdate', scores);
    // update all other players of the new player
    io.to(players[socket.id].roomId).emit('newPlayer', players[socket.id]);
    // fire the createEnemies event to the new player to generate the enemies on their local client, utilizing the enemyStates object so they get synchronized enemy placements/data.
    io.to(`${socket.id}`).emit('createEnemies', enemyStates);
  
    socket.on('disconnect', function () {
      console.log('user disconnected\n');
      //If the disconnecting player was the host, find a new one
      if(players[socket.id].isHost) {
        // remove this player from our players object
        delete players[socket.id];
        //Only chooses a new host if there's a connected player
        if(Object.keys(players).length > 0) {
          //Randomly choose a new host and change the isHost value to 'true'
          var playerKeys = Object.keys(players);
          var newHostIndex = Math.floor(Math.random() * playerKeys.length);
          players[playerKeys[newHostIndex]].isHost = true;
          scores.host = playerKeys[newHostIndex];
          //Emit the new host data to the remaining players
          io.to(players[socket.id].roomId).emit('scoreUpdate', scores);
          io.to(players[socket.id].roomId).emit('hostAssigned', players[playerKeys[newHostIndex]]);
          console.log("\nNew Host is being Selected\n");
        }
      }
      else {
        // remove this player from our players object
        delete players[socket.id];
      }
      if(Object.keys(players).length <= 0) {
        enemyStates = {};
      }
      // emit a message to all players to remove this player
      io.emit('disconnect', socket.id);
    });
  
    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      // emit a message to all players about the player that moved
      socket.in(players[socket.id].roomId).emit('playerMoved', players[socket.id]);
    });
  
    //When a player fires, emit the fire location to the other players
    socket.on('playerFire', function(data) {
      socket.to(players[socket.id].roomId).emit('playerFired', data)
    });
  
    //When a player hits an enemy, emit this to the other players
    socket.on('enemyHit', function(data){
      console.log(data);
      delete enemyStates[data.enemyId];
      socket.to(players[socket.id].roomId).emit('hitEnemy', data);
    });
    //When the client loads the required fonts, send the client the required score data
    socket.on('fontsLoaded', function() {
      io.to(`${socket.id}`).emit('scoreUpdate', scores);
    });
  
    socket.on('enemyState', function(enemyData) {
      enemyStates[enemyData.id] = enemyData;
      socket.to(players[socket.id].roomId).emit('updateEnemyState', enemyData);
    });
  
    socket.on('changeGameManager', function(data) {
      socket.to(players[socket.id].roomId).emit('updateGameManager', data);
    })
}

module.exports = sockets;