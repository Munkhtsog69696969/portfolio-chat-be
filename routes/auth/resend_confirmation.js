const express = require('express');
const User = require('../../models/User.schema');
const router = express.Router();
const bcrypt = require('bcrypt');

const sendEmail=require("../../utils/nodemailer/mail_sender")

// POST /resend_confirmation
router.post('/', async (req, res) => {
  const {email,password}=req.body

  if(!email || !password){
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const user=await User.findOne({email})

    if(!user){
      return res.status(404).json({ message: 'User doesnt exist!' });
    }

    if(user.isVerified){
        return res.status(400).json({ message: 'User already verified!' });
    }

    const isMatch = await bcrypt.compare(password, user.password); 
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendEmail(email, {id:user._id}, user).catch((error) =>
        console.error('Error sending email:', error)
    );

    res.json({ redirectUrl: `${process.env.CLIENT_ADDRESS}/mail_check?mail=${email}` });

  } catch (error) {
    res.status(500).send({ message: error});
  }
});

module.exports = router;
