import mongoose,{Schema, model} from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose'

let userScheme=new Schema({
    name:String,
    email:String,
    password:{
        type:String,
        select:false
    },
    role:{
        type: String,
        enum:['user', 'admin'],
        default: 'user',
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date
})
userScheme.plugin(passportLocalMongoose,{usernameField:'email'})



export default model('User',userScheme)