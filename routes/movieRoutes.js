const express = require('express');
const router = express.Router();
const {
    createMovie,getAllMovies,getMovieById, updateMovie, deleteMovie
} = require("../controllers/movieController");
const { createVoiceOver } = require("../controllers/voiceOverController");
const { renderMovie } = require("../controllers/movieRendererController");
const { protect } = require("../middleware/auth.middleware");

router.post("/movies", protect, createMovie);
router.get("/movies", protect, getAllMovies);
router.get("/movies/:id", protect, getMovieById);
router.put("/movies/:id", protect, updateMovie);
router.delete("/movies/:id", protect, deleteMovie);
router.post("/movies/:id/voice-over", protect, createVoiceOver);
router.post("/movies/:id/render", protect, renderMovie);
module.exports = router;