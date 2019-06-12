const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    channelId: { type: String, unique: true },
    startedAt: Date,
    endedAt: Date,
});
