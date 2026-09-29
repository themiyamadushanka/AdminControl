const axios = require('axios');
require('dotenv').config();

// Using your API key from the .env file
const IMGBB_API_KEY = process.env.IMGBB_API_KEY; 

/**
 * Uploads an image buffer to ImgBB and returns the URL.
 * @param {Buffer} fileBuffer 
 * @returns {Promise<string>} 
 */
async function uploadImageToImgBB(fileBuffer) {
    try {
        // Convert the file buffer to base64
        const base64Image = fileBuffer.toString('base64');

        // Setup the data to send
        const formData = new URLSearchParams();
        formData.append('image', base64Image);

        // Make the request to ImgBB
        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData
        );
        
        // Return the image URL from the response
        return response.data.data.url;

    } catch (error) {
        console.error('Upload failed:', error.message);
        throw new Error('Failed to upload image to ImgBB');
    }
}

module.exports = uploadImageToImgBB;