import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})

connectDB();























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