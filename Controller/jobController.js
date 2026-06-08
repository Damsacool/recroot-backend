const Job = require('../Model/jobModel');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

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

// Extract structured fields from job description
const extractJobDetails = async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required" });
        }

        const prompt = `
            You are an expert job description analyzer.

            Extract structured information from the following job description.

            JOB DESCRIPTION:
            "${jobDescription}"

            Return ONLY a JSON object in this exact format, nothing else:
            {
                "jobTitle": "<extracted job title>",
                "experience": "<required years of experience e.g 2+ Years, Entry Level, Senior>",
                "jobType": "<Remote, Hybrid, On-site or Not Specified>",
                "skills": "<comma separated list of required skills>",
                "location": "<job location or Not Specified>",
                "keySkills": [<array of the most important 5 skills required for this role>]
            }
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });

        const rawText = chatCompletion.choices[0].message.content;
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const extractedDetails = JSON.parse(cleaned);

        return res.status(200).json({
            message: "Job details extracted successfully",
            data: extractedDetails,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { createJob, getUserJobs, extractJobDetails };