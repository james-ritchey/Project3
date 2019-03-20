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
io.on("connection", (socket) => {
  require('./routes/sockets')(socket, io);
})


server.listen(PORT, (err) => {
  if (err) throw err;

  console.log(`Backend on port ${PORT}`);
});
