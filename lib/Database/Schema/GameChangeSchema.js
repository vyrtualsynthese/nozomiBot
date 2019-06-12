const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    gameId: String,
    seeAt: Date,
});
