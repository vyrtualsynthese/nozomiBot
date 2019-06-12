const GameChangeSchema = require('../Schema/GameChangeSchema');
const mongoose = require('mongoose');

module.exports = mongoose.model('GameChange', GameChangeSchema);
