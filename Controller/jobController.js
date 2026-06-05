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

module.exports = { createJob, getUserJobs };