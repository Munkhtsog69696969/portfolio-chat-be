const express = require('express');
const router = express.Router();
const Server = require("../../models/Server.schema");

// GET /get_server_info
router.get('/', async (req, res) => {
  const userId = req.user.id; 
  const { serverId } = req.query;

  if (!userId || !serverId) {
    return res.status(401).json({ message: "User id or server id required" });
  }

  try {
    // More efficient way to check user's membership/ownership
    const server = await Server.findOne({
      _id: serverId,
      $or: [
        { members: userId },
        { owners: userId }
      ]
    }).populate("members owners");

    if (!server) {
      return res.status(404).json({ message: "Server not found or user not authorized" });
    }

    res.status(200).json({ server });
   
  } catch (error) {
    console.error("Error retrieving server information:", error.message || error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;