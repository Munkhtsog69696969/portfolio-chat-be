const express = require('express');
const router = express.Router();
const ServerMessage=require("../../../models/ServerMessage.schema")

// POST /messages/server/send_message
router.post('/', async (req, res) => {
  const userId = req.user.id; 
  const {serverId,message}=req.body

  if (!userId || !serverId || !message) {
    return res.status(400).json({ message: "User ID, server ID , or message is required!" });
  }

  try {
    const newMessage=new ServerMessage({
        serverId,
        senderId:userId,
        message,
    })

    await newMessage.save()

    res.status(200).json({message:"Sent" , newMessage:newMessage})
   
  } catch (error) {
    console.error("Error while sending friend request:", error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
