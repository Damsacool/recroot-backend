const express = require('express');
const router = express.Router();

const {
    uploadResume,
    getMyResumes,
    getOneResume,
    deleteResume,
} = require("../Controller/resumeController");

router.post("/upload", uploadResume);
router.get("/my-resumes", getMyResumes);
router.get("/:id", getOneResume);
router.delete("/:id", deleteResume);

module.exports = router;