const cloudinary = require("../config/cloudinary");


const uploadVideo = async(filePath)=>{

    try{

        const result =
        await cloudinary.uploader.upload(
            filePath,
            {
                resource_type:"video",
                folder:"memory-movie/rendered"
            }
        );


        return {
            url: result.secure_url,
            publicId: result.public_id
        };


    }catch(error){

        console.log(
            "Video Upload Error:",
            error.message
        );

        throw error;

    }

}


module.exports={
    uploadVideo
};