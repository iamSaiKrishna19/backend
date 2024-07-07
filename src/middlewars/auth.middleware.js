// it only verify the user is logged in or not
import { apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new apierror(401,"Unauthorised request")
        }
    
        const decodedToken =jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apierror(401,"INVALID access token")
        }
        req.user = user;
        next() // for next 
    } catch (error) {
        throw new apierror(401,"invalide access token")
    }
})