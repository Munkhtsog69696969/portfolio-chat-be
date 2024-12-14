const jwt = require("jsonwebtoken");

const generate_refresh_token = async function (payload, expiryTime) {
    try {
        // Validate input parameters
        if (!payload || typeof payload !== "object") {
            throw new Error("Invalid payload: Payload must be a non-null object.");
        }
        if (!expiryTime || typeof expiryTime !== "string") {
            throw new Error("Invalid expiryTime: Expiry time must be a valid string.");
        }

        // Generate the token
        const token = jwt.sign(
            payload,
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: expiryTime }
        );

        return token;
    } catch (error) {
        console.error("Error generating access token:", error.message);
        throw new Error("Failed to generate access token. Please try again.");
    }
};

module.exports = generate_refresh_token;
