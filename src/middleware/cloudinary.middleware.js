const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

async function uploadToCloudinary(localPath, options = {}) {
    if (!localPath) {
        // console.error('No local path provided');
        return null;
    }

    try {
        // console.log(`Uploading file: ${localPath}`);
        const response = await cloudinary.uploader.upload(localPath, {
            folder: options.folder || "Ecommerce",
            resource_type: options.resourceType || "auto",
            ...options
        });
        
        // console.log(`File uploaded successfully. URL: ${response.secure_url}`);
        await fs.unlink(localPath);
        return {secureURL : response.secure_url , publicURL : response.public_id};
    } catch (error) {
        console.error(`Error uploading file to Cloudinary: ${error.message}`);
        await fs.unlink(localPath).catch(unlinkError => 
            console.error(`Failed to remove local file: ${unlinkError.message}`)
        );
        return null;
    }
}


async function deleteFromCloudinary(url) {

    try {

        // const urlSegments = url.split('/');
        // const versionIndex = urlSegments.findIndex(segment => segment.startsWith('v'));
        // const publicIdWithFolder = urlSegments.slice(versionIndex + 1).join('/').split('.')[0];
  
        const result = await cloudinary.uploader.destroy(url.publicURL);
        return result;
    } catch (error) {
        console.error(`Error deleting file from Cloudinary: ${error.message}`);
        return null;
    }
}
module.exports = { uploadToCloudinary  , deleteFromCloudinary};