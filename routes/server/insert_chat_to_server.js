const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");

// POST /insert_chat_to_server
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { serverId, chat } = req.body;

  // Validate input
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!serverId || !chat) {
    return res.status(400).json({ message: "Server ID and chat message are required" });
  }

  try {
    // Find the server
    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Check if user is a member or owner of the server
    const isMember = server.members.some(member => member.toString() === userId);
    const isOwner = server.owners.some(owner => owner.toString() === userId);

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }

    // Validate chat message length
    if (chat.length < 1 || chat.length > 300) {
      return res.status(400).json({ 
        message: "Message must be between 1 and 300 characters" 
      });
    }

    // Add new chat message
    server.chats.push({
      message: chat,
      senderId: userId,
      createdAt: new Date()
    });

    // Save the updated server
    await server.save();

    // Populate the last added chat with sender details
    // await server.populate('chats.senderId', 'username profilePicture');

    // Get the last added chat (most recently inserted)
    // const newChat = server.chats[server.chats.length - 1];

    res.status(201).json({ 
      message: "Chat added successfully!",
      server: server
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