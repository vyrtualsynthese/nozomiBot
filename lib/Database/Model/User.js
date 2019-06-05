const UserSchema = require('../Schema/UserSchema');
const mongoose = require('mongoose');

module.exports = mongoose.model('User', UserSchema);
