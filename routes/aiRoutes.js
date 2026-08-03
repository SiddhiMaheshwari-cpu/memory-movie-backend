const express = require("express");
const router = express.Router();
const { createScreenplay } = require("../controllers/screenplayController");

const {
    analyzeMemory
}=require("../controllers/aiController");


router.post(
    "/movies/:id/analyze",
    analyzeMemory
);
router.post("/movies/:id/screenplay", createScreenplay);


module.exports = router;