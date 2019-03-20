const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const routes = require('./routes');
const session = require('express-session');

const PORT = 4000;


const app = express();

const mongoDB = 'mongodb://127.0.0.1/project3';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;

app.use(session({
  secret: 'ldjaisudnjdkalnasdfwpienlakjs',
  resave: false, //required
  saveUninitialized: false //required
}));

app.use(express.static('public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Load in passport config
require('./config/passport.js')(passport);

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var games = [];

var players = {};

io.on("connection", (socket) => {
  // On connection, client will join to the Lobby socket.io room.
  socket.join('lobby');
  // create player
  players[socket.id] = {
    roomId: 'lobby',
    playerId: socket.id,
    isHost: false
  };
  // Emit the "userJoined" event to all OTHER connected clients in the main lobby, so we can update the display of connected users.
  socket.to("lobby").emit("userJoined", {});
  // createGame event received from frontend.
  socket.on('createGame', function() {
    // randomly generated gameId - to do a socket.join to that room and leave the lobby.
    var gameId = (Math.random()+1).toString(36).slice(2, 18);
    // join client to newly generated game
    socket.join(gameId);
    // update player roomId to gameId
    players[socket.id].roomId = gameId;
    // drop player from lobby
    socket.leave('lobby');
    // bring in the sockets file for phaser socket stuff.
    require('./routes/sockets')(socket, io);
    // emit a 'gameCreated' event to the frontend in order to display the game lobby to all connected users
    io.to('lobby').emit('gameCreated', {
      gameId: gameId
    });
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
    require('./routes/sockets')(socket, io);
    // emit 'gameJoined' event to frontend clients still in the lobby.
    io.to('lobby').emit('gameJoined');
  });
});


server.listen(PORT, (err) => {
  if (err) throw err;

  console.log(`Backend on port ${PORT}`);
});
