
var players = {};
//var game_config = require("../public/game_config.json");



var sockets = function(socket, io) {
// sockets(socket);
console.log('a user connected\n');
// create a new player and add it to our players object
players[socket.id] = {
  x: 800 / 2,
  y: 600 - 64,
  playerId: socket.id,
  isHost: false,
};

if(Object.keys(players).length === 1) {
  players[socket.id].isHost = true;
  //scores.host = socket.id;
}

// send the players object to the new player
socket.emit('currentPlayers', players);
// send the current scores
socket.emit('scoreUpdate');
// update all other players of the new player
socket.broadcast.emit('newPlayer', players[socket.id]);

socket.on('disconnect', function () {
  console.log('user disconnected\n');
  //If the disconnecting player was the host, find a new one
  if(players[socket.id].isHost ) {
    // remove this player from our players object
    delete players[socket.id];
    //Only chooses a new host if there's a connected player
    if(Object.keys(players).length > 0) {
      //Randomly choose a new host and change the isHost value to 'true'
      var playerKeys = Object.keys(players);
      var newHostIndex = Math.floor(Math.random() * playerKeys.length);
      players[playerKeys[newHostIndex]].isHost = true;
      //scores.host = playerKeys[newHostIndex];
      //Emit the new host data to the remaining players
      io.emit('scoreUpdate', scores);
      socket.broadcast.emit('hostAssigned', players[playerKeys[newHostIndex]]);
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
  socket.broadcast.emit('playerMoved', players[socket.id]);
});

//When a player fires, emit the fire location to the other players
socket.on('playerFire', function(data) {
  socket.broadcast.emit('playerFired', data)
});

//When an enemy fires, emit the fire location to the other players
socket.on('enemyShoot', function(data) {
  socket.broadcast.emit('enemyFired', data)
});

//When a player hits an enemy, emit this to the other players
socket.on('enemyHit', function(data){
  //console.log(data);
  //delete enemyStates[data.enemyId];
  socket.broadcast.emit('hitEnemy', data);
});

//When the client loads the required fonts, send the client the required score data
socket.on('fontsLoaded', function() {
  io.to(`${socket.id}`).emit('scoreUpdate', scores);
});

socket.on('enemyState', function(enemyData) {
  //enemyStates[enemyData.id] = enemyData;
  socket.broadcast.emit('updateEnemyState', enemyData);
});

socket.on('changeGameManager', function(data) {
  console.log("Sending GameManager");
  socket.broadcast.emit('updateGameManager', data);
})
}

module.exports = sockets;