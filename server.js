const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const routes = require('./routes');
const session = require('express-session');
const PORT = process.env.PORT || 4000;
const app = express();

const mongoDB = process.env.MONGODB_URI || 'mongodb://127.0.0.1/project3';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;

let players = {};

app.use(session({
  secret: 'ldjaisudnjdkalnasdfwpienlakjs',
  resave: false, //required
  saveUninitialized: false //required
}));

if(process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
else {
  app.use(express.static('public'));
}
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
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
var io = require('socket.io').listen(server, { origins : '*:*'});
io.on("connection", (socket) => {
  console.log("Hello")
  socket.join('lobby');
  require('./routes/sockets')(socket, io);
})


server.listen(PORT, (err) => {
  if (err) throw err;

  console.log(`Backend on port ${PORT}`);
});