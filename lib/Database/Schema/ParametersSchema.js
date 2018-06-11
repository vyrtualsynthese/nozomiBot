const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    paused: { type: Boolean, default: false },
});
