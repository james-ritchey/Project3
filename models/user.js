const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
});

UserSchema.methods = {
  checkPassword: function usersCheckPassword(inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
  },
  hashPassword: function usersHashPassword(plainTextPassword) {
    return bcrypt.hashSync(plainTextPassword, 10);
  }
};

UserSchema.pre('save', function userPreSave(next) {
  if (!this.password) {
    next()
  } else {
    this.password = this.hashPassword(this.password)
    next()
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;