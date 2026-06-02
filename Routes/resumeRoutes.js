const express = require('express');
const router = express.Router();

const {
    uploadResume,
    getMyResumes,
    getOneResume,
    deleteResume,
} = require("../Controller/resumeController");

const protect = require('../Middleware/authMiddleware'); // JWT guard

router.post("/upload", protect, uploadResume);
router.get("/my-resumes", protect, getMyResumes);
router.get("/:id", protect, getOneResume);
router.delete("/:id", protect, deleteResume);

module.exports = router;