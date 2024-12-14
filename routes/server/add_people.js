const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");
const User = require("../../models/User.schema"); 

// PUT /add_people
router.put('/', async (req, res) => {
  const userId = req.user.id;
  const { serverId, userToAddId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!serverId || !userToAddId) {
    return res.status(400).json({ message: "Server ID and user to add are required" });
  }

  try {
    // Find the server
    const server = await Server.findById(serverId)

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const userToAdd = await User.findById(userToAddId);
    if (!userToAdd) {
      return res.status(404).json({ message: "User to add not found" });
    }

    const isDuplicate = await Server.findOne({
      _id: serverId,
      members: { $elemMatch: { $eq: userToAddId } }
    });

    if (isDuplicate) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Add user to members using $addToSet to prevent duplicates
    const updatedServer = await Server.findByIdAndUpdate(
      serverId,
      { $addToSet: { members: userToAddId } },
      { new: true }
    ).populate("members owners");

    userToAdd.servers.push(updatedServer._id)

    await userToAdd.save()

    res.status(200).json({ 
      message: "Member added successfully!",
      server: updatedServer
    });

  } catch (err) {
    console.error('Error adding member:', err);
    
    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid server or user ID" });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;