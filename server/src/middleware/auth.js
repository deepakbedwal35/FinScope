const { getUser } = require("../services/auth");

const restrictToLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. Please log in." });
    }
    const decodedUser = getUser(token);
    if (!decodedUser) {
      return res.status(401).json({ message: "Access denied. Invalid session structure." });
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
    
    return res.status(403).json({ message: "Invalid or expired session token." });
  }
};

module.exports = {
  restrictToLoggedIn
};
