const decode_access_token = require("../utils/jwt/access_token/decode_access_token");

async function authenticate_access_token(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header is missing!" });
        }

        const bearerString = authHeader.split(' ');

        if (bearerString[0] !== "Bearer") {
            return res.status(401).json({ message: "Token must start with 'Bearer'!" });
        }

        const token = bearerString[1];

        if (!token) {
            return res.status(401).json({ message: "Token is missing!" });
        }

        const decoded = await decode_access_token(token);

        if (!decoded.valid) {
            return res.status(401).json({ message: `Invalid token: ${decoded.error || "unknown error"}` });
        }

        req.user = decoded.payload;

        next();
    } catch (err) {
        console.error("Authentication error:", err.message || err);
        res.status(500).json({ message: "Internal server error during authentication" });
    }
}

module.exports = authenticate_access_token;
