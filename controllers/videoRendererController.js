const Movie = require("../models/movieModel");
const { createMovie } = require("../services/movieEngine/movieRendererService");

const renderMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { theme } = req.body; // 👈 1. WE EXTRACT THE THEME HERE!

    console.log(`\n🎬 Rendering Movie: ${movieId}`);
    console.log(`🎛️ Director Theme Selected: ${theme || "Cinematic & Emotional"}`);

    // 1. Find movie
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // 2. Render + upload movie
    // 👈 2. WE PASS THE THEME INTO THE ENGINE HERE!
    const result = await createMovie(movie, theme);

    console.log("🎥 Movie Engine Result:", result);

    // 3. Save Cloudinary URL
    movie.movieUrl = result.videoUrl;

    // 4. Update movie status
    movie.status = "completed";
    movie.progress = 100;

    await movie.save();

    // 5. Response
    return res.status(200).json({
      success: true,
      message: "Movie rendered and uploaded successfully",
      movieId: movie._id,
      movieUrl: result.videoUrl,
      publicId: result.publicId,
    });

  } catch (error) {
    console.log("❌ Render Movie Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  renderMovie,
};