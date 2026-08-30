const Movie = require("../models/movieModel");
const { analyzeMovie } = require("../services/aiService");
// Naya Render Service yahan import karein (path check kar lijiye ki sahi hai ya nahi)
const { renderMovie: renderCinematicVideo } = require("../services/movieEngine/videoRendererService");
const analyzeMemory = async (req, res, next) => {
  try {
    console.log(`\n🧠 Starting AI Analysis for movie ID: ${req.params.id}`);
    
    // 1. Fetch the movie directly from the database using the URL parameter
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // 2. Security Check: Only the owner can analyze their movie
    if (movie.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to analyze this movie." });
    }

    // 3. Update status in database
    movie.status = "analyzing";
    await movie.save();

    // 4. Call AI Service (Returns properly parsed JSON object now)
    const analysis = await analyzeMovie(movie);

    // 5. Save AI results to the database
    movie.aiSummary = analysis.summary || "";
    movie.emotion = analysis.emotion || "";
    movie.backgroundMusic = analysis.backgroundMusic || "";
    movie.timeline = analysis.timeline || [];
    movie.posterPrompt = analysis.posterPrompt || "";
    movie.story = analysis.story || "";
    
    movie.status = "scene_planning"; // Ready for the next step!
    movie.progress = Math.max(movie.progress, 20);

    await movie.save();
    console.log(`✅ AI Analysis complete for movie ID: ${movie._id}`);

    res.status(200).json({
      success: true,
      message: "Memory analysis completed",
      data: { analysis },
    });
  } catch (error) {
    console.error("\n❌ AI Controller Error:", error.message);

    // If it fails, update the DB so the frontend knows it failed
    try {
      if (req.params.id) {
        await Movie.findByIdAndUpdate(req.params.id, {
          status: "failed",
          errorMessage: error.message
        });
      }
    } catch (dbError) {
      console.error("Failed to update error state in DB", dbError.message);
    }

    res.status(500).json({
      success: false,
      message: "Failed to analyze memories",
      error: error.message,
    });
  }
};

// ==========================================
// NEW: RENDER CINEMATIC MOVIE CONTROLLER
// ==========================================
const renderMovieController = async (req, res, next) => {
  try {
    console.log(`\n🎬 Starting Cinematic Render for movie ID: ${req.params.id}`);
    
    // 1. Fetch movie
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // 2. Verify Ownership
    if (movie.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to render this movie." });
    }

    // 3. Update Status
    movie.status = "rendering";
    await movie.save();

    // 4. Get Script and Scene Plan (Using movie.story or fallback if it's empty)
    const scriptText = movie.story && movie.story.length > 0 
      ? movie.story 
      : "The neon lights flickered in the rain. A memory of a forgotten city."; // Fallback for testing
    
    const scenePlan = movie.timeline || {};

    // 5. Trigger the Remotion + Edge-TTS Pipeline
    const videoUrl = await renderCinematicVideo(movie._id.toString(), scriptText, scenePlan);

    // 6. Save final video URL to Database
    movie.videoUrl = videoUrl;
    movie.status = "completed";
    movie.progress = 100;
    await movie.save();

    console.log(`✅ Cinematic Render complete for movie ID: ${movie._id}`);

    // 7. Send Response back to React
    res.status(200).json({
      success: true,
      message: "Movie rendered successfully",
      videoUrl: videoUrl,
    });

  } catch (error) {
    console.error("\n❌ Render Controller Error:", error.message);

    try {
      if (req.params.id) {
        await Movie.findByIdAndUpdate(req.params.id, {
          status: "failed",
          errorMessage: error.message
        });
      }
    } catch (dbError) {
      console.error("Failed to update error state in DB", dbError.message);
    }

    res.status(500).json({
      success: false,
      message: "Rendering failed",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeMemory,
  renderMovieController // Export the new controller function!
};