const express = require("express");
const router = express.Router();
const protect = require("../Middleware/authMiddleware");

const { scoreResume } = require("../Controller/scoringController");

router.post("/score", protect, scoreResume);

module.exports = router;