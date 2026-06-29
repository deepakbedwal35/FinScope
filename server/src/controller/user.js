// server/routes/scan.js

const User = require("../models/User")
const { setUser } = require("../services/auth");



const handleUserSignup = async (req, res)=>{
    try{
    const {email , password} = req.body;
    // await is important to ensure that the database operation completes before proceeding
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(400).json({
        message: "User Already Exist"
      })
    }
    
    const newUser = await  User.create({
      
      email ,
      password
    })
   
    const token = setUser(newUser);
   

    res.cookie("token" , token ,{
      httpOnly: true ,
      secure:true ,
      maxAge: 24*60*60*1000 , // 1 day

    })
    res.json({
      success: true,
      newUser_id : newUser._id ,
      newUser ,

      token
    })
  }catch(err){
    res.status(500).json({
      success: false , 
      error: err.message
    })
  }

}

const handleUserLogin = async (req , res)=>{
    try{
    const {email , password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        message: "User Not Found"
      })
    }
    if(user.password !== password){
      return res.status(400).json({
        message: "Invalid Password"
      })
    } 
    const  token  = setUser(user);

    res.cookie("token" , token ,{
      httpOnly: true ,
      secure:true ,
      maxAge: 24*60*60*1000 , // 1 day

    })

    res.json({
      success: true,
      // user_id : user._id ,
      user ,
      token
    })
  }catch(err){
    res.status(500).json({
      success: false ,
      error: err.message
    })
  }

}



module.exports = {
    handleUserSignup ,
    handleUserLogin
};