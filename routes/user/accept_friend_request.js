const express = require('express');
const router = express.Router();
const User=require("../../models/User.schema")

// POST /accept_friend_request
router.post('/:pendingId', async (req, res) => {
  const userId=req.user.id

  const {pendingId}=req.params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required!" });
  }

  if (!pendingId) {
    return res.status(400).json({ message: "Pending ID is required!" });
  }

  try {
    const user=await User.findById(userId)

    const pendingUser=await User.findById(pendingId)

    if(user.friendRequests.some(requests=>requests.toString()==pendingId)){
      user.friends.push(pendingId)

      pendingUser.friends.push(userId)

      user.friendRequests = user.friendRequests.filter(id => id.toString() !== pendingId);
      pendingUser.friendRequests=pendingUser.friendRequests.filter(id => id.toString() !== userId);

      await user.save()

      await pendingUser.save()

      res.status(200).json({message:"Accepted friend request!"})
    }

  } catch (error) {
    console.error("Logout error:", error.message || error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
});

module.exports = router;
