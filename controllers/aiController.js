const Movie =require("../models/movieModel");
const { analyzeMovie } = require("../services/aiService");


const analyzeMemory = async (req, res) => {
    try {

        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }
        const response = await analyzeMovie(movie);

const analysis = JSON.parse(response);

movie.aiSummary = analysis.summary;
movie.emotion = analysis.emotion;
movie.backgroundMusic = analysis.backgroundMusic;

await movie.save();

res.status(200).json({
    success: true,
    analysis
});

    

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports={
    analyzeMemory
}