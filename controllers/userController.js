const db = require('../models');

// Defining methods for the booksController
module.exports = {
  findOne: function({ query }, cb) { 
    db.User
      .findOne(query)
      .then((dbModel) => cb(null, dbModel))
      .catch(cb);
  },
  create: function(user, cb) {
    db.User
      .create(user)
      .then(dbModel => cb(null, dbModel))
      .catch(cb);
  },
};
