const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_KEY || "fallback_temporary_secret_key";
const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "10d";

function generateAccessToken(user) {
    const payload = {
        _id: user._id,
        email: user.email,
    };
    
    // Generates a secure access token
    return jwt.sign(payload, secret, {
        expiresIn
    }); 
}

const setUser = generateAccessToken;

const verifyAccessToken = (token) => {
    if (!token) return null;

    try {
        let actualToken = token;

        // Robust handling if the token is passed as an array from the header split
        if (Array.isArray(token)) {
            actualToken = token[1] || token[0];
        }

        // Robust handling if the token is passed as a string with the Bearer prefix
        if (typeof actualToken === 'string') {
            actualToken = actualToken.trim();
            if (actualToken.toLowerCase().startsWith('bearer ')) {
                actualToken = actualToken.slice(7).trim();
            }
        }

        return jwt.verify(actualToken, secret);
    } catch (err) {
        console.error("JWT Verification failed:", err.message);
        return null;
    }
};

const getUser = verifyAccessToken;

module.exports = {
    setUser,
    getUser,
    generateAccessToken,
    verifyAccessToken
};
