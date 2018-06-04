const StreamInfoSchema = require('../Schema/StreamInfoSchema');
const mongoose = require('mongoose');

module.exports = mongoose.model('StreamInfo', StreamInfoSchema);
