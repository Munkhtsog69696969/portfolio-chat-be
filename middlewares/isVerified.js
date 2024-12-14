const User = require("../models/User.schema");

async function isVerified(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing arguments!' });
    }

    if(password.length<6 || password.length>10){
        return res.status(400).json({ message: 'Password must be between 6 and 10 characters long!' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: `User not verified! Check your mail : ${email}` });
        }

        req.user = user;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

module.exports = isVerified;
