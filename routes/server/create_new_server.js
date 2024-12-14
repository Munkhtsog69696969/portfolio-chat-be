const express = require('express');

const router = express.Router();

const Server=require("../../models/Server.schema")
const User=require("../../models/User.schema")

// POST /create_new_server
router.post('/', async (req, res) => {
  const {server_name}=req.body

  const userId=req.user.id

  if(!server_name){
    return res.status(400).json({message:"Server name required"})
  }

  if(!userId){
    return res.status(401).json({message:"User id required"})
  }

  try {
    const existingServer=await Server.findOne({server_name})

    if(existingServer){
      return res.status(400).json({message:"Server name occupied"}) 
    }

    const newServer=new Server({
      server_name
    })

    newServer.owners.push(userId)

    await newServer.save()

    const user=await User.findById(userId)

    user.servers.push(newServer._id)

    await user.save()

    res.status(200).json({message:"Server Created!", server:newServer})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
