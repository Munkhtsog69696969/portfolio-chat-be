const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");

// PUT /promote_to_admin
router.put('/', async (req, res) => {
  const userId = req.user.id;
  const { serverId, userToPromoteId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!serverId || !userToPromoteId) {
    return res.status(400).json({ message: "Server ID and user to promote are required" });
  }

  try {
    // Populate members and owners
    const server = await Server.findById(serverId)
      .populate('members')
      .populate('owners');

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Check if the requesting user is an owner
    const isCurrentOwner = server.owners.some(owner => owner._id.toString() === userId);
    if (!isCurrentOwner) {
      return res.status(403).json({ message: "Only server owners can promote to admin" });
    }

    // Check if user is already an owner
    const isAlreadyOwner = server.owners.some(owner => owner._id.toString() === userToPromoteId);
    if (isAlreadyOwner) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    // Check if user is a member of the server
    const isMember = server.members.some(member => member._id.toString() === userToPromoteId);
    if (!isMember) {
      return res.status(404).json({ message: "User is not a member of this server" });
    }

    // Remove user from members (if they were a regular member)
    server.members = server.members.filter(member => member._id.toString() !== userToPromoteId);

    // Add user to owners
    server.owners.push(userToPromoteId);

    // Save the updated server
    await server.save();

    // After saving, populate the updated owners and members fields
    const updatedServer = await Server.findById(serverId)
      .populate('members')
      .populate('owners');

    res.status(200).json({ 
      message: "User promoted to admin successfully!",
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