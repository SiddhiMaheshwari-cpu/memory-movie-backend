const express = require('express');
const router = express.Router();
const {
    createMovie,getAllMovies,getMovieById, updateMovie, deleteMovie
} = require("../controllers/movieController");
const { createVoiceOver } = require("../controllers/voiceOverController");
const { renderMovie } = require("../controllers/movieRendererController");


router.post("/movies", createMovie);
router.get("/movies", getAllMovies);
router.get("/movies/:id", getMovieById);
router.put("/movies/:id", updateMovie);
router.delete("/movies/:id", deleteMovie);
router.post("/movies/:id/voice-over", createVoiceOver);
router.post("/movies/:id/render", renderMovie);
module.exports = router;