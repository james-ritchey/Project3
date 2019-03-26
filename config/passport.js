const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../controllers/userController.js');

module.exports = function passportConfig(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(username, done) {
    User.findOne({query : {
        username: username
    }}, function(err, user) {
        done(err, user);
    });
  });

  passport.use(new LocalStrategy(function(username, password, done) {
      User.findOne({ query : { username: username }}, function(err, user) {
        if (err) { 
          return done(err); 
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.checkPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));
};
