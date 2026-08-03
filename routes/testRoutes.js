const express = require("express");
const router = express.Router();

const {
    home,
    test,
} = require("../controllers/testController");

router.get("/", home);
router.post("/", test);

module.exports = router;