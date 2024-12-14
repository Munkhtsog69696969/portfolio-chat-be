const express = require('express');
const router = express.Router();

// POST /logout
router.post('/', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token found!' });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error("Logout error:", error.message || error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
});

module.exports = router;
