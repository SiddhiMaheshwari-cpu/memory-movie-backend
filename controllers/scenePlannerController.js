const Movie = require("../models/movieModel");
const { generateScenePlan } = require("../services/scenePlannerService");


const createScenePlan = async (req, res) => {

    try {

        const { movieId } = req.params;

        const movie = await Movie.findById(movieId);


        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }


        const scenePlan = await generateScenePlan(movie);


        movie.scenePlan = JSON.parse(scenePlan);

        await movie.save();


        res.status(200).json({
            success: true,
            message: "Scene plan generated successfully",
            scenePlan: movie.scenePlan
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};


module.exports = {
    createScenePlan
};