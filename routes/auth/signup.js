const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User.schema');
const router = express.Router();

const sendEmail=require("../../utils/nodemailer/mail_sender")

// POST /signup
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    sendEmail(email, {id:newUser._id},savedUser).catch((error) =>
      console.error('Error sending email:', error)
    );

    res.status(201).json({ message: 'User created successfully!', user: {email:newUser.email , name:newUser.name} });

  } catch (error) {
    res.status(500).send({ message: error});
  }
});

module.exports = router;
