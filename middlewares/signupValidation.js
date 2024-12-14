const validateUserInput = (req, res, next) => {
  const { name, email, password } = req.body;

  // Name validation: 3-30 characters
  if (name.length < 3 || name.length > 30) {
    return res.status(400).json({
      message: 'Name must be between 3 and 30 characters long!',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Invalid email address format!',
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[0-9]).{6,10}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must include at least one letter, one number, and be between 6 and 10 characters long!',
    });
  }

  next();
};

module.exports = validateUserInput;