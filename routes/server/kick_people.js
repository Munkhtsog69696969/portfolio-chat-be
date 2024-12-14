const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");
const User=require("../../models/User.schema")

// PUT /kick_people
router.put('/', async (req, res) => {
  const userId = req.user.id;
  const { serverId, userToKickId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!serverId || !userToKickId) {
    return res.status(400).json({ message: "Server ID and user to kick are required" });
  }

  try {
    // Find the server
    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Check if the requesting user is an owner
    const isOwner = server.owners.some(owner => owner.toString() === userId);

    if (!isOwner) {
      return res.status(403).json({ message: "Only server owners can kick members" });
    }

    // Prevent kicking owners
    const isOwnerToKick = server.owners.some(owner => owner.toString() === userToKickId);
    if (isOwnerToKick) {
      return res.status(403).json({ message: "Cannot kick a server owner" });
    }

    // Check if user is a member
    const memberIndex = server.members.findIndex(member => member.toString() === userToKickId);

    if (memberIndex === -1) {
      return res.status(404).json({ message: "User is not a member of this server" });
    }

    const kickUser = await User.findById(userToKickId);

    kickUser.servers = kickUser.servers.filter(serverIds => serverIds !== serverId);

    await kickUser.save();
    
    // Remove user from members
    server.members.splice(memberIndex, 1);

    // Save the updated server
    await server.save();

    const updatedServer=await Server.findById(serverId).populate("members owners")

    res.status(200).json({ 
      message: "Member kicked successfully!",
      server: updatedServer
    });

  } catch (err) {
    console.error(err);
    
    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid server or user ID" });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;