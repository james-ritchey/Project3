const router = require('express').Router();
const User = require('../../controllers/userController');
const passport = require('passport')

// Matches with '/api/users'
router.post('/signup', ({ body }, res) => {
  User.create(body, (err, data) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate username
        return res.status(500).send({ success: false, message: 'User already exist!' });
      }

      // Some other error
      return res.status(500).send(err);
    }
    // This userObject is made to pass information easily in the form of JSON
    const userObject = {
      'username': data.username
    };
    res.json(userObject);
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  // This userObject is made to pass information easily in the form of JSON
  const userObject = {
    'username': req.user.username
  };
  res.json(userObject);
});

module.exports = router;


