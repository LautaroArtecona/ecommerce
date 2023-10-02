import mongoose from "mongoose";

let userScheme=new mongoose.Schema([
    name:String,
    email:String,
    password:{
        type:String,
        select:false
    },
    resetPasswordToken:String,
    resetPasswordExpires:date
])

module.exports=mongoose('User',userScheme)