const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  photoUri: String,
  apiResults: Object,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Result', ResultSchema);