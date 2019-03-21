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
  hiscores: function(limit, cb) {
    db.User
      .find({},
         ['username', 'hiscore'], //fields to return
         { //object that says how to return information
           skip: 0,
           limit: limit,
           sort: {
             hiscore: -1
           }
         })
      .then((dbModel) => cb(null, dbModel))
      .catch(cb);
  }
};
