const StaticCommandSchema = require('../Schema/StaticCommandSchema');
const mongoose = require('mongoose');

module.exports = mongoose.model('StaticCommand', StaticCommandSchema);
