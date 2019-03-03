const db = require('../models');

// Defining methods for the booksController
module.exports = {
  findOne: function(req, res) { 
    db.User
      .findOne(req.query)
      .then((dbModel) => res(null, dbModel))
      .catch(err => res.status(422).json(err));
  },
  create: function(req, res) {
    db.User
      .create(req.body)
      .then(dbModel => res(null, dbModel))
      .catch(err => res.status(422).json(err));
  },
};
