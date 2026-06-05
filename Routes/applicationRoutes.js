const express = require("express");
const router = express.Router();
const protect = require("../Middleware/authMiddleware");

const {
    applyToJob,
    getMyApplications,
    getJobApplications,
    updateStatus,
} = require("../Controller/applicationController");

router.post("/apply", protect, applyToJob);
router.get("/my-applications", protect, getMyApplications);
router.get("/job/:jobId", protect, getJobApplications);
router.patch("/:id/status", protect, updateStatus);

module.exports = router;