const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");

// DELETE /delete_server
router.delete('/', async (req, res) => {
  const userId = req.user.id;
  const { serverId} = req.body;

  // Validate input
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!serverId) {
    return res.status(400).json({ message: "Server ID required" });
  }

  try {
    // Find the server
    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    if(!server.owners.includes(userId)){
        return res.status(401).json({ message: "Unauthorized!" });
    }

    const deletedServer=await Server.findByIdAndDelete(serverId)

    res.status(200).json({
        message:"Server deleted"
    })

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