const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username :{
        type :String,
        required :true,
        unique :true,
    },
    password :{
        type :String,
        required:true,
    },
    role :{
        type :String, 
        required : true,
        enum : ["Admin", "Organizer","Attendee"],
    },
     email: {
        type: String,
        required: true,
        unique: true,
    },
    otp :{
        type :String,
    }, 
    otpExpiry :{
        type :Date,
    },
    isVerified :{
        type :Boolean,
        default :false,
    }

}, {timestamps :true})

module.exports = mongoose.model('User' , userSchema)