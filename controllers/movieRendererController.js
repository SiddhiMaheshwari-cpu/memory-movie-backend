const Movie = require("../models/movieModel");
const { createMovie } = require("../services/movieEngine/movieRendererService");

const renderMovie = async (req, res) => {
    try {
        

        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        const renderedMovie = await createMovie(movie);

        movie.movieUrl = renderedMovie.videoUrl;
        movie.moviePublicId = renderedMovie.publicId;

        await movie.save();

        res.status(200).json({
            success: true,
            message: "Movie rendered successfully",
            videoUrl: renderedMovie.videoUrl,
            publicId: renderedMovie.publicId
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    renderMovie
};