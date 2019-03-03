const router = require('express').Router();
const User = require('../../controllers/userController');
const passport = require('passport')

// Matches with '/api/users'
router.post('/signup', (req, res) => {
  User.create(req, (err, ures) => {
    // This userObject is made to pass information easily in the form of JSON
    const userObject = {
      'username': ures.username
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


