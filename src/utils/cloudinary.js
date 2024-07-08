import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { apierror } from './apierror.js';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
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
        fs.unlinkSync(localfilelocation)
    } catch (error) {
        fs.unlinkSync(localfilelocation) // removes the localy saved temporary file
        return null
    }
}

const deletfile = async function(localfilelocation){
    try {
        if(!localfilelocation) return null
        await cloudinary.uploader.destroy(localfilelocation)
        console.log("file is removed")
    } catch (error) {
        throw new apierror(500,"Something went wrong")
    }
}

export {uploadfile,deletfile}

