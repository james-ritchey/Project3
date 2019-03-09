var players = {};
var game_config = require("../public/game_config.json");
var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
var scores = {
  blue: 0,
  red: 0
};
var sockets = function(socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
      x: game_config.width / 2,
      y: game_config.height - 50,
      playerId: socket.id,
      team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
  
    // send the star object to the new player
    socket.emit('starLocation', star);
    // send the current scores
    socket.emit('scoreUpdate', scores);
  
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
  
    socket.on('disconnect', function () {
      console.log('user disconnected');
      // remove this player from our players object
      delete players[socket.id];
      // emit a message to all players to remove this player
      socket.broadcast.emit('disconnect', socket.id);
    });
  
      // when a player moves, update the player data
      socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
      });
  
    socket.on('playerFire', function(data) {
      socket.broadcast.emit('playerFired', data)
    });
    socket.on('enemyHit', function(data){
      socket.broadcast.emit('hitEnemy', data);
    })
}

module.exports = sockets;