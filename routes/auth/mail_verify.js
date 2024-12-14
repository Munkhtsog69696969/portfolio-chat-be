const express = require('express');
const User = require('../../models/User.schema');
const router = express.Router();

const decode_mail_token=require("../../utils/jwt/mail/decode_mail_token")

// GET /mail_verify
router.get('/:token', async (req, res) => {
  const {token}=req.params

  if(!token){
    return res.status(400).json({message:"Token required!"})
  }

  try {
    const decoded=await decode_mail_token(token)

    if(!decoded.valid){
        return res.status(401).json({message:"Unauthorized token or expired token!"})
    }

    const userId=decoded.payload.id

    const user=await User.findById(userId)

    if(!user){
      return res.status(400).json({message:"User doesnt exist"})
    }

    if(user.mail_verification_token!==token){
      return res.status(401).json({message:"Unauthorized token or expired token! Check your newest confirmation mail!"})
    }

    user.isVerified=true

    await user.save()

    res.redirect(process.env.CLIENT_ADDRESS + '/mail_verified');

  } catch (error) {
    res.status(500).send({ message: error});
  }
});

module.exports = router;
