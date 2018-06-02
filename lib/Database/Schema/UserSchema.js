const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    username: { type: String, unique: true },
    lastJoined: Date,
    lastLeaved: Date,
    joinedUptime: { type: Number, default: 0 }, // in seconds, approximative
});
