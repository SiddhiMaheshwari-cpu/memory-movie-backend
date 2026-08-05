/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered movie generation APIs
 */

/**
 * @swagger
 * /movies/{id}/analyze:
 *   post:
 *     summary: Analyze movie memories
 *     description: Analyze uploaded memories and generate AI insights such as summary and emotion.
 *     tags: [AI]
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
 *         description: Analysis completed successfully
 *       404:
 *         description: Movie not found
 */

/**
 * @swagger
 * /movies/{id}/screenplay:
 *   post:
 *     summary: Generate screenplay
 *     description: Generate an AI screenplay for the selected movie.
 *     tags: [AI]
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
 *         description: Screenplay generated successfully
 *       404:
 *         description: Movie not found
 */
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { createScreenplay } = require("../controllers/screenplayController");

const {
    analyzeMemory
}=require("../controllers/aiController");


router.post(
    "/movies/:id/analyze",protect,
    analyzeMemory
);
router.post("/movies/:id/screenplay", protect, createScreenplay);


module.exports = router;