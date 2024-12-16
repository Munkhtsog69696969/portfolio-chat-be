const express = require('express');
const router = express.Router();
const ServerMessage=require("../../../models/ServerMessage.schema")
const Server=require("../../../models/Server.schema")

// GET /messages/server/get_message
router.get('/', async (req, res) => {
  const userId = req.user.id; 
  const { serverId, limit = 20, page = 1 } = req.query;

  if (!userId || !serverId) {
    return res.status(400).json({ message: "User ID, server ID is required!" });
  }


  try {
    const server=await Server.findById(serverId)

    if(!server) return

    if(!server.members.includes(userId) && !server.owners.includes(userId)){
        return res.status(401).json({message:"Your not member nor owner of this server!"})
    }

    const messages=await ServerMessage.find({
        serverId
    }).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(parseInt(limit, 10));

    res.status(200).json(messages.reverse());

  } catch (error) {
    console.error("Error while sending friend request:", error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
