// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    const portnumber = process.env.PORT || 3000
    app.on("error",()=>{
        console.log("express error")
    })
    app.listen(portnumber,()=>{
        console.log(`Server is running at port ${portnumber}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection not happend",err)
})























// (async()=>{
//     try {
//         await mongoose.createConnection(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         console.log("Connected Succefully!!!!")
//         app.on("error",()=>{
//             console.log("express error")
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listing on ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log("mongodb didn't connect :",error)
//     }
// })()