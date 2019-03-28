const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

var players = {};
//var game_config = require("../public/game_config.json");
var games = {};

var sockets = function(socket, io) {
  // sockets(socket);
  console.log('a user connected\n');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: 800 / 2,
    y: 600 - 64,
    playerId: socket.id,
    isHost: false,
    score: 0,
  };

  socket.on('roomRequest', function() {
    //map all the roomids to an array
    let ids = Object.keys(players).map(player => players[player].roomId)
    //filter through the array to remove undefined values
    let cleanedIds = ids.filter(ids => ids !== undefined);
    //Use set to only have access to unique values
    let roomIds = [...new Set(cleanedIds)];

    io.to(socket.id).emit('roomResponse', roomIds)
  });




  // createGame event received from frontend.
  socket.on('createGame', function() {
      // randomly generated gameId - to do a socket.join to that room and leave the lobby.
      var gameId = (Math.random()+1).toString(36).slice(2, 18);
      players[socket.id].isHost = true;
        //scores.host = socket.id;
      // join client to newly generated game
      socket.join(gameId);
      // update player roomId to gameId
      players[socket.id].roomId = gameId;
      io.to('lobby').emit('gameCreated', {
        gameId: gameId
      });
      // drop player from lobby
      socket.leave('lobby');
      // bring in the sockets file for phaser socket stuff.
      // add game to games object
      games[gameId] = {
        players: {}
      };
      // add player to the players list/object contained in the games object
      games[gameId].players[socket.id] = {
        player: players[socket.id]
      };

      // emit a 'gameCreated' event to connected frontend clients in order to display the game lobby to all connected users

      // emit a 'thisGameCreated' event to the frontend that created the game so they can be added to that game instances' player list.
      //Make list of players with correct room id
      let playerList = [];
      for(let player in players) {
        if(players[player].roomId === players[socket.id].roomId) {
          playerList.push(players[player]);
        }
      }
      // send the players object to the new player
      setTimeoutPromise(0500).then(() => {
        io.in(players[socket.id].roomId).emit('currentPlayers', {
          playerList: playerList,
          gameId: gameId
        });
      });
      
      // send the current scores
      io.in(players[socket.id].roomId).emit('scoreUpdate');
      // update all other players of the new player
    });

    // joinGame event received from frontend.  'data' variable will contain the gameId, which is stored as a data attribute in the link used to join the active game session.
    socket.on('joinGame', function(data) {
      // join client to existing game session - room name is the gameId value, pulled from the data attribute in the link used to join the game.
      socket.join(data.gameId);
      // set the roomId key:value pair of the player object to the gameId value for later socket use/reference.
      players[socket.id].roomId = data.gameId;
      // drop player from lobby
      socket.leave('lobby');
      // bring in the separate sockets file for phaser socket stuff
      // emit 'gameJoined' event to frontend clients still in the lobby.
      socket.to('lobby').emit('gameJoined');

      // emit 'currentGameJoin' event to other players in an existing game session so they can add that player to their game instances' list of connected players on the client.
      // io.in(data.gameId).emit('currentGameJoin', {
      //   player: players[socket.id],
      //   gameId: data.gameId
      // });

      // send the players object to the new player
      
      //Make list of players with correct room id
      let playerList = [];
      for(let player in players) {
        if(players[player].roomId === players[socket.id].roomId) {
          playerList.push(players[player]);
        }
      }
      setTimeoutPromise(0500).then(() => {
        io.in(players[socket.id].roomId).emit('currentPlayers', {
          playerList: playerList,
          gameId: data.gameId
        });
      });
      // send the current scores
      io.in(players[socket.id].roomId).emit('scoreUpdate');
    });

  socket.on('gameFull', function(data){
    io.in('lobby').emit('roomRemove', data);
  });
  
  socket.on('disconnect', function () {
    console.log('user disconnected\n');
    //If the disconnecting player was the host, find a new one

    //Check to see if player is last with roomId
    let roomId = players[socket.id].roomId;

    if(players[socket.id].isHost ) {
      // remove this player from our players object

      //New lobby system we don't want to delete just remove from game players list
      delete players[socket.id];

      //Only chooses a new host if there's a connected player

      //List of players in room
      let playerList = [];
      for(let player in players) {
        if(players[player].roomId === roomId) {
          playerList.push(players[player]);
        }
      }

      if(playerList.length > 0) {
        //Randomly choose a new host and change the isHost value to 'true'
        //var playerKeys = Object.keys(players);
        var newHostIndex = Math.floor(Math.random() * playerList.length);

        players[playerList[newHostIndex].playerId].isHost = true;
        //scores.host = playerKeys[newHostIndex];
        //Emit the new host data to the remaining players
        io.to(roomId).emit('scoreUpdate');
        io.to(roomId).emit('hostAssigned', players[playerList[newHostIndex].playerId]);
        console.log("\nNew Host is being Selected\n");
      }
    }
    else {
      //delete player object
      delete players[socket.id];

    }
    if(Object.keys(players).length <= 0) {
      enemyStates = {};
    }
    //Remove the roomid from the socket
    socket.leave(roomId);
    socket.join("lobby");
    let remaining = Object.keys(players).filter((player) => players[player].roomId === roomId);
    
    if(remaining.length === 0) {
      io.to('lobby').emit('roomRemove', roomId);
    }
    //Add socket back to lobby
    // emit a message to all players to remove this player
    console.log(players);
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // emit a message to all players about the player that moved
    io.to(players[socket.id].roomId).emit('playerMoved', players[socket.id]);
  });

  //When a player fires, emit the fire location to the other players
  socket.on('playerFire', function(data) {
    socket.to(players[socket.id].roomId).emit('playerFired', data)
  });

  //When an enemy fires, emit the fire location to the other players
  socket.on('enemyShoot', function(data) {
    socket.to(players[socket.id].roomId).emit('enemyFired', data)
  });

  //When a player hits an enemy, emit this to the other players
  socket.on('enemyHit', function(data){
    //console.log(data);
    //delete enemyStates[data.enemyId];
    socket.to(players[socket.id].roomId).emit('hitEnemy', data);
  });

  //When the client loads the required fonts, send the client the required score data
  socket.on('fontsLoaded', function() {
    io.to(`${socket.id}`).emit('scoreUpdate');
  });

  socket.on('enemyState', function(enemyData) {
    //enemyStates[enemyData.id] = enemyData;
    socket.to(players[socket.id].roomId).emit('updateEnemyState', enemyData);
  });

  socket.on('changeGameManager', function(data) {
    socket.to(players[socket.id].roomId).emit('updateGameManager', data);
  });

  socket.on('restartGame', function() {
    socket.to(players[socket.id].roomId).emit('restartGame');
  });
  socket.on('playerKilled', function(player) {
    socket.to(players[socket.id].roomId).emit('killPlayer', player);
  });
  socket.on('gameOver', function() {
    socket.to(players[socket.id].roomId).emit('endGame');
  });
  socket.on('playerHit', function(data) {
    socket.to(players[socket.id].roomId).emit('hitPlayer', data);
  });
}

//End of the sockets


module.exports = sockets;