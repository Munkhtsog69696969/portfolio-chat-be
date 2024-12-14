const express = require('express');
const router = express.Router();
const PrivateMessage=require("../../../models/PrivateMessage.schema")

// GET /messages/private/get_message
router.get('/', async (req, res) => {
  const userId = req.user.id; 
  const { otherUserId, limit = 20, page = 1 } = req.query;

  if (!userId || !otherUserId) {
    return res.status(400).json({ message: "User ID or other user ID is required!" });
  }

  try {
    const messages=await PrivateMessage.find({
        $or :[
            {senderId:userId, receiverId:otherUserId},
            {senderId:otherUserId, receiverId:userId}
        ],
    }).sort({timestamp:-1}).skip((page - 1) * limit).limit(parseInt(limit, 10));

    res.status(200).json(messages.reverse())
   
  } catch (error) {
    console.error("Error while sending friend request:", error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
