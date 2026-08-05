const Movie = require("../models/movieModel");

const createMovie = async (req, res,next) => {
  try {
    console.log("✅ Controller reached");
    const { title, theme, photos, videos, audio, chatScreenshots } = req.body;

    const movie = await Movie.create({
      title,
      theme,
      owner: req.user._id,
      photos,
      videos,
      audio,
      chatScreenshots,
    });

    console.log("✅ Movie saved:", movie);

    res.status(201).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.log("❌ Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllMovies = async (req, res) => {
  try {
    console.log("GET/movies hit");

    const movies = await Movie.find({
      owner: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    if (movie.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this movie.",
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    if (movie.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this movie.",
      });
    }

   if (req.body.title) {
  movie.title = req.body.title;
}

if (req.body.theme) {
  movie.theme = req.body.theme;
}

await movie.save();

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    if (movie.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this movie.",
      });
    }

    await movie.deleteOne();

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
};
