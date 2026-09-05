const express = require("express");
const router = express.Router();
const { restrictToLoggedIn } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { handleUserSignup, handleUserLogin } = require("../controller/user");
router.post("/signup", validate(registerSchema), handleUserSignup);
router.post("/login", validate(loginSchema), handleUserLogin);

router.get("/check-auth", restrictToLoggedIn, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, 
    sameSite: "None", 
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
