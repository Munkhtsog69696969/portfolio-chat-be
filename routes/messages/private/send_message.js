const express = require('express');
const router = express.Router();
const PrivateMessage=require("../../../models/PrivateMessage.schema")

// POST /messages/private/send_message
router.post('/', async (req, res) => {
  const userId = req.user.id; 
  const {recieverId,message}=req.body

  if (!userId || !recieverId || !message) {
    return res.status(400).json({ message: "User ID, recieverId , or message is required!" });
  }

  try {
    const newMessage=new PrivateMessage({
        recieverId,
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
