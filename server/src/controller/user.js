const User = require("../models/User");
const { setUser } = require("../services/auth");
const bcrypt = require("bcrypt"); 

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, 
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000 * 10, 
};


const handleUserSignup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    const userPayload = { _id: newUser._id, email: newUser.email };
    const token = setUser(userPayload);

    res.cookie("token", token, COOKIE_OPTIONS);
    return res.json({
      success: true,
      user: userPayload,
      token,
    });
  } catch (err) {
    // 🟢 This will now forward the error to your global errorHandler middleware safely
    next(err); 
  }
};


const handleUserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // Handle plain-text vs bcrypt passwords safely
    let isMatch = false;
    const isBcryptHash = /^(\$2[aby]\$).{56}$/.test(user.password);
    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const userPayload = { _id: user._id, email: user.email };
    const token = setUser(userPayload);

    res.cookie("token", token, COOKIE_OPTIONS);
    return res.json({
      success: true,
      user: userPayload,
      token,
    });
  } catch (err) {
    next(err); 
  }
};

module.exports = {
  handleUserSignup,
  handleUserLogin,
};
