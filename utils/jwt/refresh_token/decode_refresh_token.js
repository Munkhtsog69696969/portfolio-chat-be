const jwt=require("jsonwebtoken")

const decode_refresh_token=async function(token){
    try {
        // Verify and decode the token using the secret
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
        return { valid: true, payload: decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

module.exports=decode_refresh_token