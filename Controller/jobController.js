const Job = require('../Model/jobModel');

// Save a new job description
const createJob = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const job = await Job.create({
      userId: req.user.id,
      title,
      description
    });

    res.status(201).json({ message: 'Job saved successfully.', job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save job.', details: error.message });
  }
};

// Get all jobs for the logged-in user
const getUserJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs.', details: error.message });
  }
};

// Analyze resume against job description (AI hook)
const analyzeMatch = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume text and job description are required.' });
    }

    // 🔧 AI logic will plug in here — placeholder for now
    const mockResult = {
      matchScore: 72,
      missingSkills: ['TypeScript', 'GraphQL', 'System Design'],
      interviewQuestions: [
        'Walk me through a project where you optimized performance.',
        'How do you handle state management in React?',
        'Describe your experience with REST APIs.',
        'How would you approach debugging a failing API endpoint?',
        'What is your process for code reviews?'
      ]
    };

    res.status(200).json(mockResult);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed.', details: error.message });
  }
};

module.exports = { createJob, getUserJobs, analyzeMatch };