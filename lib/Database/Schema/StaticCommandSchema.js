const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    name: { type: String, unique: true },
    response: String,
    created: { type: Date, default: new Date() },
});
