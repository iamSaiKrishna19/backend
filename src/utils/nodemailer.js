import nodemailer from "nodemailer"
// import dotenv from "dotenv"
import { generateOTP } from "./otpgenerator.js"
// dotenv.config({
//     path: '.env'
// })


const sendingmail = async(receiverEmail,OTP)=>{
    const auth = nodemailer.createTransport({
        service : "gmail",
        secure : false,
        port : 587,
        auth : {
            user : process.env.EMAIL,
            pass : process.env.PASSWORD
        }
    })
    
    const receiver ={
        from : process.env.EMAIL,
        to : receiverEmail,
        subject : "OTP sending",
        text : `your OTP  is ${OTP}`
    }
    
    auth.sendMail(receiver,(err,res)=>{
        if(err) throw err
        // else console.log("done")
    })

}

export {sendingmail}
