import {asyncHandler} from "../utils/asynchandler.js"
import {apierror} from "../utils/apierror.js"
import { validateEmail } from "../utils/validate.js"
import { User } from "../models/user.model.js"
import { uploadfile } from "../utils/cloudinary.js"
import { apiresponse } from "../utils/apiresponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(UserId)=>{
    try {
        const user = await User.findById(UserId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefershToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return{accessToken,refreshToken}
        
    } catch (error) {
        throw new apierror(500,"something went wrong while generating refresh and access token")
    }
}




const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,fullName,password} = req.body
    console.log("email" , email);
    // if(fullName===""){
    //     throw new apierror(400,"fullname is required")
    // }

    
    if(
        [fullName,email,password,username].some((field)=>
            field?.trim()===""))
    {
        throw new apierror(400,"All crediantions are nessensary")
    }


    const verifyemail = await validateEmail(email);
    if(!verifyemail){
        throw new apierror(402,"Email must be valid")
        console.log("email not ")
    }


    const existeduser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new apierror(409,"User already exist email/username")
    }
    


    const avtarLocalpath = req.files?.avatar[0]?.path
    const coverImagePath = req.files?.coverImage[0]?.path

    if(!avtarLocalpath){
        throw new apierror(400,"Avtar image is required")
    }
    if(!coverImagePath){
        coverImagePath = ""
    }

    const avatar = await uploadfile(avtarLocalpath)
    const coverImage = await uploadfile(coverImagePath)

    if(!avatar) throw new apierror(400,"Avtar image is required")

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImagePath?.url | "",
        email,
        password,
        username : username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apierror(500,"something went wrong while adding to db")
    }

    return res.status(201).json(
        new apiresponse(200,createdUser,"user register succesfully")
    )


})

const loginUser = asyncHandler(async(req,res)=>{
    const { username,password,email } = req.body

    // console.log("username","\n",username)

    if(!(username || email)){
        throw new apierror(402,"Username/email is required")
    }

    const user = await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new apierror(404,"User does not exist")
    }

    const passCheck = await user.isPasswordcorrect(password)

    if(!passCheck){
        throw new apierror(400,"Password is Incorrect")
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)
    const loguser = await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly : true,
        secure : true
    }

    return res.status(400)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiresponse(200,{
            user : loguser,accessToken,refreshToken //object modifing
        },"Loged in successfully!!!")
    )
})


const logoutUser  = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
        )
        const options ={
            httpOnly : true,
            secure : true
        } 
        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new apiresponse(200,{},"User logged out!!!"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new apierror(404,"Kindly login again")
    }                             
    
    try {
        const decodedtoken = await jwt.verify(incomingRefreshToken,process.env.REFERSEH_TOKEN_SECRET)
        const user = await User.findById(decodedtoken._id)
        if(!user){
            throw new apierror(401,"invalid refresh token")
        }         
        if(incomingRefreshToken===user?.refreshToken){
            throw new apierror(401,"refresh token is expired or used")
        }
        const {newrefreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res.status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newrefreshToken)
        .json(
            new apiresponse(401,
                {
                    accessToken, refreshToken : newrefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apierror(500,error.message || "invalid")
    }
})


export {registerUser,loginUser,logoutUser,refreshAccessToken}