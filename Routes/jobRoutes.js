const express = require('express');
const router = express.Router();
const { createJob, getUserJobs, extractJobDetails } = require('../Controller/jobController');
const protect = require('../Middleware/authMiddleware');

router.post('/create-job', protect, createJob);
router.get('/my-jobs', protect, getUserJobs);
router.post('/extract', protect, extractJobDetails);

module.exports = router;