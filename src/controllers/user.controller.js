import {asyncHandler} from "../utils/asynchandler.js"
import {apierror} from "../utils/apierror.js"
import { validateEmail } from "../utils/validate.js"
import { User } from "../models/user.model.js"
import { uploadfile } from "../utils/cloudinary.js"
import { apiresponse } from "../utils/apiresponse.js"

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
export {registerUser}