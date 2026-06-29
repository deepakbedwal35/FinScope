const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET_KEY || "fallback_temporary_secret_key"

function setUser(user){
    const payload = {
        _id: user._id ,
        email: user.email,
        
    };
//  it creates tokens
    return  jwt.sign(payload , secret , {
        
        expiresIn:"10d"
    }); 

}
const getUser = (token)=>{
    if(!token){
        return null;
    }
    try{
        return jwt.verify(token , secret);

    }catch(err){
        return null

    }
    

}


module.exports = {
    setUser ,
    getUser
}