/**
 * @swagger
 * tags:
 *   name: Video Renderer
 *   description: Final movie rendering APIs
 */

/**
 * @swagger
 * /movies/render/{movieId}:
 *   post:
 *     summary: Render final movie
 *     description: Renders the final AI Memory Movie for the specified movie.
 *     tags: [Video Renderer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie rendered successfully
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Rendering failed
 */
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
    renderMovie
} = require("../controllers/videoRendererController");


router.post(
    "/render/:movieId",protect,
    renderMovie
);


module.exports = router;