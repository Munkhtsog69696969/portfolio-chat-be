const mongoose = require('mongoose');

const serverMessageSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName:{type:String, required:true},
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ServerMessage = mongoose.model('ServerMessage', serverMessageSchema);

module.exports = ServerMessage;
