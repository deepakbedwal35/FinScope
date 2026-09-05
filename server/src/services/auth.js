const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_KEY || "fallback_temporary_secret_key";

function setUser(user) {
    const payload = {
        _id: user._id,
        email: user.email,
    };
    
    // Generates a secure token that expires in 10 days
    return jwt.sign(payload, secret, {
        expiresIn: "10d"
    }); 
}

const getUser = (token) => {
    if (!token) return null;

    try {
        let actualToken = token;

        // Robust handling if the token is passed as an array from the header split
        if (Array.isArray(token)) {
            actualToken = token[1] || token[0];
        }

        // Robust handling if the token is passed as a single string with the Bearer prefix
        if (typeof actualToken === 'string' && actualToken.startsWith('Bearer ')) {
            actualToken = actualToken.slice(7).trim();
        }

        return jwt.verify(actualToken, secret);
    } catch (err) {
        console.error("JWT Verification failed:", err.message);
        return null;
    }
};

module.exports = {
    setUser,
    getUser
};
