const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    paused: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
    displayFollows: { type: Boolean, default: false },
});
