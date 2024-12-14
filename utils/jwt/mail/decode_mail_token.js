const jwt=require("jsonwebtoken")

const decode_mail_token=async function(token){
    try {
        // Verify and decode the token using the secret
        const decoded = jwt.verify(token, process.env.JWT_NODEMAILER_SECRET);
        return { valid: true, payload: decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

module.exports=decode_mail_token