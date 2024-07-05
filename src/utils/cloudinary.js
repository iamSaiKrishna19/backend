import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
await cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View Credentials' below to copy your API secret
});




// uploading the file to the cloudinary
const uploadfile = async function(localfilelocation){
    try {
        if(!localfilelocation) return null
        const response = await cloudinary.uploader.upload(localfilelocation,{
            resource_type: "auto"
        })
        console.log("file is uploaded",response)
        return response;
    } catch (error) {
        fs.unlinkSync(localfilelocation) // removes the localy saved temporary file
        return null
    }
}


