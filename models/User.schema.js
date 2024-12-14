const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
    minlength: [3, "Name must be at least 3 characters long!"],
    maxlength: [30, "Name cannot be longer than 30 characters!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  mail_verification_token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  servers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Server",
  }]
});

// Compile schema into a model
const User = mongoose.model("User", userSchema);

module.exports = User;
