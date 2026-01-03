const mongoose = require('mongoose');

const play11Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

// The fix is in this line:
// 1st argument ('Model') is a name for Mongoose to use internally.
// 3rd argument ('models') is the *exact* name of your collection in MongoDB.
module.exports = mongoose.model('Model', play11Schema, 'models');