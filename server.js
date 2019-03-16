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
  scores: [],
  host: "no one"
};

var enemyStates = {};

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

  if(Object.keys(players).length === 1) {
    players[socket.id].isHost = true;
    scores.host = socket.id;
  }

  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // send the star object to the new player
  socket.emit('starLocation', star);
  // send the current scores
  socket.emit('scoreUpdate', scores);
  socket.emit('updateEnemyState', enemyStates);
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
        scores.host = playerKeys[newHostIndex];
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

  //Listens for when a star is collected, left over from the tutorial prototype
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

  //When a player fires, emit the fire location to the other players
  socket.on('playerFire', function(data) {
    socket.broadcast.emit('playerFired', data)
  });

  //When a player hits an enemy, emit this to the other players
  socket.on('enemyHit', function(data){
    console.log(data);
    var enemyData = enemyStates[data.enemyId];
    enemyData.x = data.newX;
    socket.broadcast.emit('hitEnemy', enemyData);
  });
  //When the client loads the required fonts, send the client the required score data
  socket.on('fontsLoaded', function() {
    io.to(`${socket.id}`).emit('scoreUpdate', scores);
  });

  socket.on('enemyState', function(enemyData) {
    if(enemyData.kill) {
      delete enemyStates[enemyData.id];
      socket.emit('updateEnemyState', enemyStates);
    }
    else {
      enemyStates[enemyData.id] = enemyData;
    }
  });

});

server.listen(1942, function () {
  console.log(`Listening on ${server.address().port}`);
});