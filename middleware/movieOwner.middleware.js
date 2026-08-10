const Movie = require("../models/movieModel");

const authorizeMovieOwner = async (req, res, next) => {
  try {
    const movieId = req.params.id || req.params.movieId;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    if (movie.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this movie",
      });
    }

    req.movie = movie;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify movie ownership",
    });
  }
};

module.exports = { authorizeMovieOwner };
