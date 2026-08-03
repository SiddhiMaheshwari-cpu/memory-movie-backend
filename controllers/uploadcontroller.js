const cloudinary = require("../config/cloudinary");
const Movie = require("../models/movieModel");
const uploadFile = async (req, res) => {
  try {
    console.log(req.file);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory-movie",
    });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadPhotoToMovie = async (req, res) => {
  try {
    console.log("Movie ID:", req.params.id);
    console.log("File:", req.file);
    console.log(req.body);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory-movie",
    });

    console.log(result);

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    movie.photos.push({
      url: result.secure_url,
      publicId: result.public_id,
      description: req.body.description,
      emotion: req.body.emotion,
    });
    await movie.save();

    res.status(200).json({
      success: true,
      photo: result.secure_url,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const deletePhoto = async (req, res) => {
  try {
    const { movieId, photoId } = req.params;
    console.log("Movie ID:", movieId);
    console.log("Photo ID:", photoId);

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    const photo = movie.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }
    await cloudinary.uploader.destroy(photo.publicId);
    photo.deleteOne();
    await movie.save();
    res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadVideoToMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log("Movie ID:", movieId);
    console.log(req.file);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory-movie/videos",
      resource_type: "video",
    });

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    movie.videos.push({
      url: result.secure_url,
      publicId: result.public_id,
      description: req.body.description,
      emotion: req.body.emotion,
    });
    await movie.save();

    res.status(200).json({
      success: true,
      video: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteVideo = async (req, res) => {
  try {
    const { movieId, videoId } = req.params;
    console.log("Movie ID:", movieId);
    console.log("Video ID:", videoId);
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    const video = movie.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    await cloudinary.uploader.destroy(video.publicId, {
      resource_type: "video",
    });
    video.deleteOne();
    await movie.save();
    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadAudioToMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log("Movie ID:", movieId);
    console.log(req.file);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory-movie/audio",
      resource_type: "video",
    });
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    movie.audio.push({
      url: result.secure_url,
      publicId: result.public_id,
      transcript: req.body.transcript,
    });
    await movie.save();

    res.status(200).json({
      success: true,
      audio: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteAudio = async (req, res) => {
  try {
    const { movieId, audioId } = req.params;
    console.log("Movie ID:", movieId);
    console.log("Audio ID:", audioId);
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    const audio = movie.audio.id(audioId);
    if (!audio) {
      return res.status(404).json({
        success: false,
        message: "Audio not found",
      });
    }
    await cloudinary.uploader.destroy(audio.publicId, {
      resource_type: "video",
    });
    audio.deleteOne();
    await movie.save();
    res.status(200).json({
      success: true,
      message: "Audio deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadChatScreenshotToMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log("Movie ID:", movieId);
    console.log(req.file);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory-movie/chat-screenshots",
      resource_type: "image",
    });

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    movie.chatScreenshots.push({
      url: result.secure_url,
      publicId: result.public_id,
      description: req.body.description,
    });
    await movie.save();

    res.status(200).json({
      success: true,
      chatScreenshot: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteChatScreenshot = async (req, res) => {
  try {
    const { movieId, screenshotId } = req.params;
    console.log("Movie ID:", movieId);
    console.log("Screenshot ID:", screenshotId);
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    const screenshot = movie.chatScreenshots.id(screenshotId);
    if (!screenshot) {
      return res.status(404).json({
        success: false,
        message: "Screenshot not found",
      });
    }
    await cloudinary.uploader.destroy(screenshot.publicId, {
      resource_type: "image",
    });
    screenshot.deleteOne();
    await movie.save();
    res.status(200).json({
      success: true,
      message: "Screenshot deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  uploadPhotoToMovie,
  deletePhoto,
  uploadVideoToMovie,
  deleteVideo,
  uploadAudioToMovie,
  deleteAudio,
  uploadChatScreenshotToMovie,
  deleteChatScreenshot,
};
