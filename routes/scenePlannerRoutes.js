/**
 * @swagger
 * tags:
 *   name: Scene Planner
 *   description: Scene planning APIs
 */

/**
 * @swagger
 * /movies/{movieId}/scene-plan:
 *   post:
 *     summary: Generate scene plan
 *     description: Creates an AI-generated scene plan for a movie.
 *     tags: [Scene Planner]
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
 *         description: Scene plan generated successfully
 *       404:
 *         description: Movie not found
 */
const express = require("express");

const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
    createScenePlan
} = require("../controllers/scenePlannerController");


router.post("/:movieId/scene-plan", protect, createScenePlan);


module.exports = router;