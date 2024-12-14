const express = require('express');
const router = express.Router();
const User = require("../../models/User.schema");

// GET /get_friends
router.get('/', async (req, res) => {
  const userId = req.user.id; 

  if (!userId) {
    return res.status(400).json({ message: "User ID is required!" });
  }

  try {
    const user = await User.findById(userId).populate(['friends', 'friendRequests']);

    res.status(200).json({user})
   
  } catch (error) {
    console.error("Error while sending friend request:", error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
