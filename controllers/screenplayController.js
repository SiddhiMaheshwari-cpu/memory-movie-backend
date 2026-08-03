const Movie = require("../models/movieModel");
const { generateScreenplay } = require("../services/screenplayService");
const { parseAIResponse } = require("../utils/parser");
const createScreenplay = async (req, res) => {
    try {

        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        const response = await generateScreenplay(movie);
        console.log("========== AI RESPONSE ==========");
console.log(response);
console.log("=================================");
        const screenplay = parseAIResponse(response);


        movie.screenplay = screenplay;

        await movie.save();

        res.status(200).json({
            success: true,
            screenplay
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
module.exports = {
    createScreenplay
};