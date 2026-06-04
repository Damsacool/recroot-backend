const express = require('express');
const router = express.Router();

const {
    uploadResume,
    getMyResumes,
    getOneResume,
    deleteResume,
} = require("../Controller/resumeController");

const protect = require('../Middleware/authMiddleware'); 
const upload = require("../Middleware/uploadMiddleware");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/my-resumes", protect, getMyResumes);
router.get("/:id", protect, getOneResume);
router.delete("/:id", protect, deleteResume);

module.exports = router;