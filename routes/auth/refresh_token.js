const express = require('express');

const User=require("../../models/User.schema")

const router = express.Router();

const generate_access_token=require("../../utils/jwt/access_token/generate_access_token")
const decode_access_token=require("../../utils/jwt/access_token/decode_access_token")

const generate_refresh_token=require("../../utils/jwt/refresh_token/generate_refresh_token")
const decode_refresh_token=require("../../utils/jwt/refresh_token/decode_refresh_token")

// POST /refresh_token

router.post('/', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    console.log("Refresh token:", refreshToken)
  
    if (!refreshToken) return res.status(401).json({message:"Unauthorized! Missing refresh token!"});
    
    try {
      const decodedRefreshToken =await decode_refresh_token(refreshToken)

      if(!decodedRefreshToken.valid){
        return res.status(401).json({message:"Unauthorized! Refresh token"});
      }
      
      const user = await User.findById(decodedRefreshToken.payload.id);

      if (!user) return res.status(404).json({message:"User not found!"})
  
      // Generate new access token
      const accessToken =await generate_access_token({id:user._id},"1h");
  
      res.json({ accessToken });
    } catch (error) {
      res.sendStatus(403);
    }
});

module.exports = router;

  