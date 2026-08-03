const Movie = require("../models/movieModel");

const createMovie = async (req, res) => {
  try {
    console.log("✅ Controller reached");
    const { title, theme, photos, videos, audio, chatScreenshots } = req.body;

    const movie = await Movie.create({
      title,
      theme,
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

    const movies = await Movie.find();

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
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
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

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

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
