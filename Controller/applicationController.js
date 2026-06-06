const Groq = require("groq-sdk");
const ApplicationModel = require("../Model/applicationModel");
const ResumeModel = require("../Model/resumeModel");
const JobModel = require("../Model/jobModel");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// To apply to a job 
const applyToJob = async (req, res) => {
    try {
        const { jobId, resumeId } = req.body;
        const candidateId = req.user._id;

        // To check if job exists
        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // To check if resume exists
        const resume = await ResumeModel.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // To check if candidate already applied to this job
        const existingApplication = await ApplicationModel.findOne({
            candidateId,
            jobId,
        });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied to this job" });
        }

        // The AI prompt to evaluate the resume against the job description 
        const prompt = `
            You are an expert HR recruiter and resume evaluator.

            Evaluate how well the following resume matches the job description.

            RESUME:
            ${resume.extractedText}

            JOB DESCRIPTION:
            ${job.description}

            Return ONLY a JSON object in this exact format, nothing else:
            {
                "matchScore": <overall match percentage between 0 and 100>,
                "scoreBreakdown": {
                    "skillsMatch": <number between 0 and 100>,
                    "experienceMatch": <number between 0 and 100>,
                    "educationMatch": <number between 0 and 100>,
                    "overallFit": <number between 0 and 100>
                },
                "matchScore": <number between 0 and 100>,
                "matchedSkills": [<list of skills the candidate has that match the job>],
                "missingSkills": [<list of skills the job requires that the candidate lacks>],
                "aiFeedback": "<a short paragraph of honest feedback about the candidate's fit>",
                "resumeImprovementTips": [<list of specific things the candidate should add or improve on their resume>]
            }
        `;

        // To call Groq AI
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const rawText = chatCompletion.choices[0].message.content;
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const aiResponse = JSON.parse(cleaned);

        // To create the application with AI results
        const application = await ApplicationModel.create({
            candidateId,
            jobId,
            resumeId,
            matchScore: aiResponse.matchScore,
            scoreBreakdown: aiResponse.scoreBreakdown,
            matchedSkills: aiResponse.matchedSkills,
            missingSkills: aiResponse.missingSkills,
            aiFeedback: aiResponse.aiFeedback,
            resumeImprovementTips: aiResponse.resumeImprovementTips,
            aiProcessingStatus: "completed",
        });

        return res.status(201).json({
            message: "Application submitted successfully",
            data: application,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// For a candidate to see all their applications
const getMyApplications = async (req, res) => {
    try {
        const candidateId = req.user._id;

        const applications = await ApplicationModel.find({ candidateId })
            .populate("jobId", "title description")
            .populate("resumeId", "fileName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your applications",
            data: applications,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// For a recruiter to see all candidates who applied to their job
const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;

        // To make sure the job belongs to the logged in recruiter
        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view these applications" });
        }

        // To get all applications ranked by match score
        const applications = await ApplicationModel.find({ jobId })
            .populate("candidateId", "fullName email")
            .populate("resumeId", "fileName")
            .sort({ matchScore: -1 });

        return res.status(200).json({
            message: "Job applications",
            totalCandidates: applications.length,
            data: applications,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// For a recruiter to shortlist or reject a candidate
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["applied", "under_review", "shortlisted", "rejected", "hired"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const application = await ApplicationModel.findByIdAndUpdate(
            id,
            {
                status,
                isShortlisted: status === "shortlisted",
                shortlistedAt: status === "shortlisted" ? new Date() : null,
                reviewedAt: new Date(),
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({
            message: "Application status updated",
            data: application,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    applyToJob,
    getMyApplications,
    getJobApplications,
    updateStatus,
};