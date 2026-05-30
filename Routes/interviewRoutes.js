const express = require('express');
const router = express.Router();
const {
    generateInterviewQuestions,
    getCandidateInterviews,
    getInterviewById,
    deleteInterview,
} = require('../controllers/interviewController');

const protect = require('../middleware/authMiddleware'); // JWT guard

router.post('/generate', protect, generateInterviewQuestions);  // Step 6 of MVP flow
router.get('/', protect, getCandidateInterviews);               // Candidate dashboard
router.get('/:id', protect, getInterviewById);                  // View one session
router.delete('/:id', protect, deleteInterview);                // Clean up

module.exports = router;