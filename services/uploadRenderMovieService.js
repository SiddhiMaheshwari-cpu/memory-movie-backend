const cloudinary=require("../config/cloudinary");
const uploadRenderMovie=async(videoPath)=>{
    const result=await cloudinary.uploader.upload(videoPath,{
        resource_type:"video",
        folder:"memory-movie/final-movies"
    });
    return result;
};

module.exports={uploadRenderMovie};