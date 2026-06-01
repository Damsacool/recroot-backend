const express = require('express');
const router = express.Router();
const {
    generateInterviewQuestions,
    getCandidateInterviews,
    getInterviewById,
    deleteInterview,
} = require('../Controller/interviewController');

//const protect = require('../Middleware/authMiddleware'); // JWT guard

router.post('/generate',  generateInterviewQuestions);  // Step 6 of MVP flow
router.get('/',  getCandidateInterviews);               // Candidate dashboard
router.get('/:id',  getInterviewById);                  // View one session
router.delete('/:id',  deleteInterview);                // Clean up

module.exports = router;