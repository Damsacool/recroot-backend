const express = require('express');
const router = express.Router();
const { createJob, getUserJobs, analyzeMatch } = require('../Controller/jobController');
const protect = require('../Middleware/authMiddleware');

router.post('/', protect, createJob);
router.get('/', protect, getUserJobs);
router.post('/analyze', protect, analyzeMatch);

module.exports = router;