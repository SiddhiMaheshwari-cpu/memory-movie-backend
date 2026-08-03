const Movie = require("../models/movieModel");
const { createMovie } = require("../services/movieEngine/movieRendererService");
const {
  uploadRenderMovie,
} = require("../services/uploadRenderMovieService");

const renderMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const videoPath = await createMovie(movie);

    const uploadedMovie = await uploadRenderMovie(videoPath);

    movie.movieUrl = uploadedMovie.secure_url;

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie rendered and uploaded successfully",
      movieUrl: movie.movieUrl,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  renderMovie,
};
