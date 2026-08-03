const express = require("express");

const router = express.Router();

const {
    createScenePlan
} = require("../controllers/scenePlannerController");


router.post("/:movieId/scene-plan", createScenePlan);


module.exports = router;