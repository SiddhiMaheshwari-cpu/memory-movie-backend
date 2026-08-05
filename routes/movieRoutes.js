/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: AI Memory Movie management APIs
 */

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     description: Creates a new movie for the authenticated user.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - theme
 *             properties:
 *               title:
 *                 type: string
 *                 example: Goa Trip Memories
 *               theme:
 *                 type: string
 *                 example: Travel
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *               audio:
 *                 type: array
 *                 items:
 *                   type: string
 *               chatScreenshots:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     description: Returns all movies created by the authenticated user.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of movies
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie found
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update movie
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete movie
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /movies/{id}/voice-over:
 *   post:
 *     summary: Generate AI voice-over
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voice-over generated successfully
 */

/**
 * @swagger
 * /movies/{id}/render:
 *   post:
 *     summary: Render final movie
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie rendered successfully
 */
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