const { getUser, verifyAccessToken } = require("../services/auth");

const restrictToLoggedIn = (req, res, next) => {
  try {
    let token = null;

    // 1. Extract from Authorization header (Bearer <token> or raw token)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === "string") {
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        token = authHeader.slice(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    // 2. Extract from custom x-access-token header
    if (!token && req.headers["x-access-token"]) {
      token = req.headers["x-access-token"];
    }

    // 3. Fallback to cookies
    if (!token) {
      token = req.cookies?.accessToken || req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. Please log in." });
    }

    const verify = verifyAccessToken || getUser;
    const decodedUser = verify(token);
    if (!decodedUser) {
      return res.status(401).json({ success: false, message: "Access denied. Invalid or expired token." });
    }

    req.user = decodedUser;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error.message);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    });

    return res.status(403).json({ success: false, message: "Invalid or expired session token." });
  }
};

module.exports = {
  restrictToLoggedIn,
  authenticateToken: restrictToLoggedIn
};
