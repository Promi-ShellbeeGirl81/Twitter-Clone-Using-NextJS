import cloudinary from "cloudinary";
cloudinary.config({
    cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

export const uploadMedia=async(file)=>{
    const uploadResponse=await cloudinary.uploader.upload(file,{
        resource_type:"auto",
    });
    return uploadResponse.secure_url;
}