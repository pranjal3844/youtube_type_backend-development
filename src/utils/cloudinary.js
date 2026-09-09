import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KRY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadonCloaudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file uploaded successfully
        // console.log("file hab been uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;


    } catch{
        fs.unlinkSync(localFilePath) //upload the locally saved temporary file as the upload is failed
        return null;
    }
}

export {uploadonCloaudinary}

