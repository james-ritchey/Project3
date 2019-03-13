var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var game_config = require("./public/game_config.json");
// var sockets = require("./routes/sockets.js");

var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
var scores = {
  blue: 0,
  red: 0,
  host: "no one"
};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket) {
  // sockets(socket);
  console.log('a user connected\n');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: game_config.width / 2,
    y: game_config.height - 64,
    playerId: socket.id,
    isHost: false,
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
    console.log('user disconnected\n');
    if(players[socket.id].isHost ) {
      // remove this player from our players object
      delete players[socket.id];

      var playerKeys = Object.keys(players);
      var newHostIndex = Math.floor(Math.random() * playerKeys.length);
      players[playerKeys[newHostIndex]].isHost = true;
      console.log(players[playerKeys[newHostIndex]])
      scores.host = playerKeys[newHostIndex];
      io.emit('scoreUpdate', scores);
      socket.broadcast.emit('hostAssigned', players[playerKeys[newHostIndex]]);
      console.log("\nNew Host is being Selected\n");

    }
    else {
      // remove this player from our players object
      delete players[socket.id];
    }
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  socket.on('assignHost', function(hostData) {
    players[socket.id].isHost = hostData.isHost;
    scores.host = socket.id;
    socket.emit('scoreUpdate', scores);
    socket.broadcast.emit('hostAssigned', players[socket.id]);
  })

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('starCollected', function () {
    if (players[socket.id].team === 'red') {
      scores.red += 10;
    } else {
      scores.blue += 10;
    }
    star.x = Math.floor(Math.random() * 700) + 50;
    star.y = Math.floor(Math.random() * 500) + 50;
    io.emit('starLocation', star);
    io.emit('scoreUpdate', scores);
  });

  socket.on('playerFire', function(data) {
    socket.broadcast.emit('playerFired', data)
  });

  socket.on('enemyHit', function(data){
    socket.broadcast.emit('hitEnemy', data);
  });

});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});