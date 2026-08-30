const Movie = require("../models/movieModel");
const { createMovie } = require("../services/movieEngine/movieRendererService");

const renderMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" });
        }

        if (movie.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // 1. Update initial status
        movie.status = "rendering";
        movie.renderJob = {
            status: "processing",
            stage: "rendering_scenes",
            progress: 10,
            startedAt: new Date(),
        };
        await movie.save();

        console.log(`🎬 Starting background render for: ${movie._id}`);

        // 2. RUN IN BACKGROUND
        createMovie(movie)
            .then(async (renderedMovie) => {
                movie.movieUrl = renderedMovie.videoUrl;
                movie.moviePublicId = renderedMovie.publicId;
                movie.status = "completed";
                movie.progress = 100;
                movie.renderJob = {
                    status: "completed",
                    stage: "finished",
                    progress: 100,
                    completedAt: new Date(),
                };
                movie.errorMessage = "";
                await movie.save();
                console.log(`✅ Background render saved to DB for: ${movie._id}`);
            })
            .catch(async (error) => {
                console.error("❌ Background Render Failed:", error);
                movie.status = "failed";
                movie.errorMessage = error.message;
                movie.renderJob.status = "failed";
                movie.renderJob.completedAt = new Date();
                await movie.save();
            });

        // 3. IMMEDIATELY RETURN RESPONSE TO FRONTEND
        res.status(202).json({
            success: true,
            message: "Movie rendering started in the background. Please check back later.",
            status: "processing"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { renderMovie };