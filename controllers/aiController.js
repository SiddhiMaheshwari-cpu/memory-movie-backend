const Movie = require("../models/movieModel");
const { analyzeMovie } = require("../services/aiService");
const { parseAIResponse } = require("../utils/parser");

const analyzeMemory = async (req, res) => {
  try {
    const movie = req.movie;

    movie.status = "analyzing";
    await movie.save();

    const response = await analyzeMovie(movie);
    const analysis = parseAIResponse(response);

    movie.aiSummary = analysis.summary || "";
    movie.emotion = analysis.emotion || "";
    movie.backgroundMusic = analysis.backgroundMusic || "";
    movie.timeline = analysis.timeline || [];
    movie.posterPrompt = analysis.posterPrompt || "";
    movie.story = analysis.story || "";
    movie.status = "uploaded";
    movie.progress = Math.max(movie.progress, 20);

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Memory analysis completed",
      data: { analysis },
    });
  } catch (error) {
    console.error(error);

    if (req.movie) {
      req.movie.status = "failed";
      req.movie.errorMessage = error.message;
      await req.movie.save();
    }

    res.status(500).json({
      success: false,
      message: "Failed to analyze memories",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeMemory,
};
