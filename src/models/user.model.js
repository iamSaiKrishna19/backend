import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username:{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true // for searching purpose
    },
    email:{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    fullName:{
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    },
    objAvatar :{
        type : Object
    },
    objCoverImage :{
        type : Object
    }


},
{
    timestamps : true
}

)

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordcorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function (){
     return await jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRE
        }
     ) 
}

userSchema.methods.generateRefershToken = async function (){
    return await jwt.sign(
       {
           _id : this._id
       },
       process.env.REFERSEH_TOKEN_SECRET,
       {
        expiresIn : process.env.REFERSEH_TOKEN__EXPIRE
       }
    ) 
}

export const User = mongoose.model("User",userSchema)