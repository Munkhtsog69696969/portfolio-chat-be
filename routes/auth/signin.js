const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const generate_access_token=require("../../utils/jwt/access_token/generate_access_token")
const decode_access_token=require("../../utils/jwt/access_token/decode_access_token")

const generate_refresh_token=require("../../utils/jwt/refresh_token/generate_refresh_token")
const decode_refresh_token=require("../../utils/jwt/refresh_token/decode_refresh_token")

// POST /signin
router.post('/', async (req, res) => {
  const { password } = req.body; 
  const user = req.user; 

  if (!user || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password); 
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken=await generate_access_token({id:user._id},"1h")
    const refreshToken=await generate_refresh_token({id:user._id},"7d")

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // console.log(accessToken)

    res.status(200).json({ accessToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
