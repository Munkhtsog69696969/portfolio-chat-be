const express = require('express');
const router = express.Router();
const User = require("../../models/User.schema");

// POST /send_friend_request
router.post('/:receiverId', async (req, res) => {
  const userId = req.user.id;
  const receiverId = req.params.receiverId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required!" });
  }

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required!" });
  }

  try {
    if (userId === receiverId) {
      return res.status(400).json({ warning: "You can't send a request to yourself!" });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ warning: "User not found!" });
    }

    const user=await User.findById(userId)

    // Convert ObjectIds to strings for comparison
    const receiverFriends = receiver.friends.map(friend => friend.toString());
    const receiverFriendRequests = receiver.friendRequests.map(request => request.toString());

    // Remove userId from receiver's friends and friendRequests arrays if it exists
    if (receiverFriends.includes(userId)) {
      receiver.friends = receiver.friends.filter(friend => friend.toString() !== userId);
      user.friends=user.friends.filter(friend=> friend.toString()!==receiverId)
      await receiver.save();
      await user.save()
      return res.status(200).json({ message: "Removed from friends!" });
    }

    if (receiverFriendRequests.includes(userId)) {
      receiver.friendRequests = receiver.friendRequests.filter(request => request.toString() !== userId);
      user.friendRequests=user.friendRequests.filter(friend=> friend.toString()!==receiverId)
      await receiver.save();
      await user.save()
      return res.status(200).json({ message: "Removed pending request!" });
    }

    // Add the userId to the receiver's friendRequests array
    receiver.friendRequests.push(userId);
    user.friendRequests.push(receiverId)

    await receiver.save();
    await user.save()

    res.status(200).json({ message: "Sent friend request!" });

  } catch (error) {
    console.error("Error while sending friend request:", error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
