const cloudinary = require("../config/cloudinary");
const Movie = require("../models/movieModel");


const uploadToCloudinary = async (
  filePath,
  folder,
  resourceType = "image"
) => {

  const result = await cloudinary.uploader.upload(filePath,{
    folder,
    resource_type: resourceType,
  });

  return result;
};



// Upload Photo(s)

const uploadPhotoToMovie = async(req,res)=>{

try{

const movie = await Movie.findById(req.params.id);

if(!movie){
return res.status(404).json({
success:false,
message:"Movie not found"
});
}


if(!req.files || req.files.length===0){

return res.status(400).json({
success:false,
message:"No photos uploaded"
});

}



const uploadedPhotos=[];


for(const file of req.files){

const result = await uploadToCloudinary(
file.path,
"memory-movie/photos",
"image"
);


movie.photos.push({

url:result.secure_url,

publicId:result.public_id,

description:req.body.description || "",

emotion:req.body.emotion || ""

});


uploadedPhotos.push(result.secure_url);

}


await movie.save();


res.status(200).json({

success:true,

message:"Photos uploaded successfully",

photos:uploadedPhotos

});


}
catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});

}

};





// Upload Video(s)

const uploadVideoToMovie = async(req,res)=>{

try{


const movie = await Movie.findById(req.params.id);


if(!movie){

return res.status(404).json({

success:false,

message:"Movie not found"

});

}



if(!req.files || req.files.length===0){

return res.status(400).json({

success:false,

message:"No videos uploaded"

});

}



const uploadedVideos=[];



for(const file of req.files){


const result = await uploadToCloudinary(

file.path,

"memory-movie/videos",

"video"

);



movie.videos.push({

url:result.secure_url,

publicId:result.public_id,

description:req.body.description || "",

emotion:req.body.emotion || ""

});


uploadedVideos.push(result.secure_url);


}



await movie.save();



res.json({

success:true,

message:"Videos uploaded successfully",

videos:uploadedVideos

});


}
catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});

}

};






// Upload Audio(s)

const uploadAudioToMovie = async(req,res)=>{

try{


const movie = await Movie.findById(req.params.id);


if(!movie){

return res.status(404).json({

success:false,

message:"Movie not found"

});

}



if(!req.files || req.files.length===0){

return res.status(400).json({

success:false,

message:"No audio uploaded"

});

}



const audios=[];



for(const file of req.files){


const result = await uploadToCloudinary(

file.path,

"memory-movie/audio",

"video"

);



movie.audio.push({

url:result.secure_url,

publicId:result.public_id,

transcript:req.body.transcript || ""

});


audios.push(result.secure_url);


}



await movie.save();



res.json({

success:true,

message:"Audio uploaded successfully",

audio:audios

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};






// Upload Chat Screenshots

const uploadChatScreenshotToMovie = async(req,res)=>{


try{


const movie = await Movie.findById(req.params.id);


if(!movie){

return res.status(404).json({

success:false,

message:"Movie not found"

});

}



if(!req.files || req.files.length===0){

return res.status(400).json({

success:false,

message:"No screenshots uploaded"

});

}



const screenshots=[];



for(const file of req.files){


const result = await uploadToCloudinary(

file.path,

"memory-movie/chat-screenshots",

"image"

);



movie.chatScreenshots.push({

url:result.secure_url,

publicId:result.public_id,

description:req.body.description || ""

});


screenshots.push(result.secure_url);


}



await movie.save();



res.json({

success:true,

message:"Chat screenshots uploaded successfully",

screenshots

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};






// Delete Photo

const deletePhoto = async(req,res)=>{

try{


const {movieId,photoId}=req.params;


const movie = await Movie.findById(movieId);


if(!movie){

return res.status(404).json({

success:false,

message:"Movie not found"

});

}



const photo = movie.photos.id(photoId);


if(!photo){

return res.status(404).json({

success:false,

message:"Photo not found"

});

}



await cloudinary.uploader.destroy(photo.publicId);


photo.deleteOne();


await movie.save();



res.json({

success:true,

message:"Photo deleted"

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};





// Delete Video

const deleteVideo = async(req,res)=>{

try{


const {movieId,videoId}=req.params;


const movie = await Movie.findById(movieId);


const video = movie.videos.id(videoId);



if(!video){

return res.status(404).json({

success:false,

message:"Video not found"

});

}



await cloudinary.uploader.destroy(
video.publicId,
{
resource_type:"video"
}
);



video.deleteOne();

await movie.save();



res.json({

success:true,

message:"Video deleted"

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};





// Delete Audio

const deleteAudio = async(req,res)=>{

try{


const {movieId,audioId}=req.params;


const movie=await Movie.findById(movieId);


const audio=movie.audio.id(audioId);



if(!audio){

return res.status(404).json({

success:false,

message:"Audio not found"

});

}



await cloudinary.uploader.destroy(
audio.publicId,
{
resource_type:"video"
}
);


audio.deleteOne();


await movie.save();


res.json({

success:true,

message:"Audio deleted"

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};






// Delete Screenshot

const deleteChatScreenshot = async(req,res)=>{

try{


const {movieId,screenshotId}=req.params;


const movie=await Movie.findById(movieId);


const screenshot=movie.chatScreenshots.id(screenshotId);



if(!screenshot){

return res.status(404).json({

success:false,

message:"Screenshot not found"

});

}



await cloudinary.uploader.destroy(
screenshot.publicId
);



screenshot.deleteOne();


await movie.save();



res.json({

success:true,

message:"Screenshot deleted"

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};



module.exports={

uploadPhotoToMovie,

deletePhoto,

uploadVideoToMovie,

deleteVideo,

uploadAudioToMovie,

deleteAudio,

uploadChatScreenshotToMovie,

deleteChatScreenshot

};