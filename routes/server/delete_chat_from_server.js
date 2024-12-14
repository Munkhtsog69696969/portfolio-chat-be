const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");

// DELETE /delete_chat_from_server
router.delete('/', async (req, res) => {
  const userId = req.user.id;
  const { serverId, chatId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!serverId || !chatId) {
    return res.status(400).json({ message: "Server ID and Chat ID are required" });
  }

  try {
    // Find the server
    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Find the index of the chat message
    const chatIndex = server.chats.findIndex(chat => 
      chat._id.toString() === chatId && 
      (chat.senderId.toString() === userId || 
       server.owners.some(owner => owner.toString() === userId))
    );

    // Check if chat message exists and user is authorized
    if (chatIndex === -1) {
      return res.status(404).json({ message: "Chat message not found or not authorized" });
    }

    // Remove the chat message
    server.chats.splice(chatIndex, 1);

    // Save the updated server
    await server.save();

    res.status(200).json({ 
      message: "Chat message deleted successfully!",
      deletedChatId: chatId
    });

  } catch (err) {
    console.error(err);
    
    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid server or chat ID" });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;