const mongoose = require("mongoose")
const connectDB = async ()=>{
    mongoose.connect(process.env.MONGO_URI , {dbName:"FinScope"})
    .then(()=>{
        console.log("Connected to DB")
   
    })
    .catch((err)=>console.log("DB connection error: " + err.message));
};
module.exports = connectDB;