const express = require("express");
const router = express.Router();

const {
    renderMovie
} = require("../controllers/videoRendererController");


router.post(
    "/render/:movieId",
    renderMovie
);


module.exports = router;