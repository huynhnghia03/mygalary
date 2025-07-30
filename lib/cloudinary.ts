import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
    buffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<string> => {
    try {
        // Convert buffer to base64
        const base64String = buffer.toString('base64');
        const dataURI = `data:${mimeType};base64,${base64String}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            public_id: fileName.split('.')[0], // Remove file extension
            format: fileName.split('.').pop(), // Use original file extension
        });

        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload file to storage');
    }
};
