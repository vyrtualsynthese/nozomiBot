const ParametersSchema = require('../Schema/ParametersSchema');
const mongoose = require('mongoose');

module.exports = mongoose.model('Parameters', ParametersSchema);
