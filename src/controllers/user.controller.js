import {asyncHandler} from "../utils/asynchandler.js"
import {apierror} from "../utils/apierror.js"
import { validateEmail } from "../utils/validate.js"
import { User } from "../models/user.model.js"
import { deletfile, uploadfile } from "../utils/cloudinary.js"
import { apiresponse } from "../utils/apiresponse.js"
import jwt from "jsonwebtoken"
import { generateOTP } from "../utils/otpgenerator.js"
import { sendingmail } from "../utils/nodemailer.js"




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

const changePass = async(user,newpassword)=>{

    user.password = newpassword
    user.OTP = null
    await user.save({validateBeforeSave: false})

}

const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,fullName,password} = req.body
    // console.log("email" , email);
    
    if(
        [fullName,email,password,username].some((field)=>
            field?.trim()===""))
    {
        throw new apierror(400,"All crediantions are nessensary")
    }


    const verifyemail = await validateEmail(email);
    if(!verifyemail){
        throw new apierror(402,"Email must be valid")
        // console.log("email not ")
    }


    const existeduser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new apierror(409,"User already exist email/username")
    }
    


    const avtarLocalpath = req.files?.avatar[0]?.path

    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage)) {
        coverImagePath = req.files.coverImage[0].path
    }

    if(!avtarLocalpath){
        throw new apierror(400,"Avtar image is required")
    }
    

    const avatar = await uploadfile(avtarLocalpath)
    const coverImage = await uploadfile(coverImagePath)

    if(!avatar) throw new apierror(400,"Avatar image is required")
    

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        objAvatar : avatar,
        objCoverImage : coverImage || "", 
        coverImage : coverImage?.url || "",
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
    const loguser = await User.findById(user._id).select("-password -refreshToken -objAvatar -objCoverImage")

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

const changeAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    console.log(req.file)
    if(!avatarLocalPath) throw new apierror(400,"path not given")
    const newavatar = await uploadfile(avatarLocalPath)
    
    const useravatar = await User.findById(req.user._id)
    const old = useravatar.objAvatar.public_id
    console.log("oldpublic id",old)
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: newavatar.url,
                objAvatar : newavatar
            }
        },
        {new: true}
    ).select("-password -objAvatar")

    await deletfile(old)

    return res
    .status(200)
    .json(
        new apiresponse(200, user, "Avatar image updated successfully")
    )

})

const changeCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    // console.log(req.file)

    if(!coverImageLocalPath) throw new apierror(400,"path not given")
    const newcoverimage = await uploadfile(coverImageLocalPath)
    
    const usercoverimage = await User.findById(req.user._id)

    let old
    let check = false
    if(usercoverimage.coverImage){
        old = usercoverimage.objCoverImage?.public_id
        check = true
    }

    // console.log("oldpublic id",old)
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: newcoverimage.url,
                objCoverImage : newcoverimage
            }
        },
        {new: true}
    ).select("-password -objAvatar -objCoverImage")

    if(check) await deletfile(old)

    return res
    .status(200)
    .json(
        new apiresponse(200, user, "Avatar image updated successfully")
    )

})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword} = req.body
    const user = await User.findById(req.user._id)
    const passCheck = await user.isPasswordcorrect(oldpassword)
    if(!passCheck){
        throw new apierror(400,"Password is Incorrect")
    }
    user.password = newpassword
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new apiresponse(200, {}, "Password changed successfully"))
})

const forgetPasword = asyncHandler(async(req,res)=>{
    const {email} = req.body
    if(!email) throw new apierror(404,"Email is required")

    const user = await User.findOne({email})

    if(!user) throw new apierror(404,"User not found")
    
    const OTP = generateOTP()

    user.OTP = OTP
    await user.save({validateBeforeSave: false})

    sendingmail(email,OTP)
    return res.status(200)
    .json(
        new apiresponse(200,user,"otp send successfully")
    )
    
})

const verifyOTP = asyncHandler(async(req,res)=>{
    const{email} = req.params
    const{OTP,newpassword} = req.body
    const user = await User.findOne({email})
    console.log(user.OTP)

    if(user.OTP==OTP){
        await changePass(user,newpassword)
        console.log("password changed")
    }
    else{
        throw new apierror(400,"OTP is incorrect")
    }

})

export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeAvatar,
        changeCoverImage,
        changePassword,
        forgetPasword,
        verifyOTP
    }