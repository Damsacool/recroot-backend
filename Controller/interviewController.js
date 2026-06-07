const Interview = require('../Model/interviewModel');
const Resume = require('../Model/resumeModel');
const Groq = require('groq-sdk');               

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

//  Generate Interview Questions 
const generateInterviewQuestions = async (req, res) => {
    try {
        const { resumeId, jobDescription, jobRole } = req.body;
        const userId = req.user.id;               // comes from auth middleware

        // 1. Fetch the resume text from DB
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // 2. Build the AI prompt
            const prompt = `
        You are an expert interviewer preparing questions for a job interview.
        
        The candidate is applying for the role of: "${jobRole}".
        
        Here is the job description:
        "${jobDescription}"
        
        Here is the candidate's resume:
        "${resume.extractedText}"
        
        Generate 5 to 10 interview questions following these rules strictly:
        - At least 60% of questions must be based on the job description and role requirements
        - No more than 30% of questions should reference the candidate's specific background
        - Include questions that test if the candidate can learn and adapt to this role even if their background is different
        - Mix technical, behavioral and situational questions relevant to the job role
        - Do not ignore the job description in favor of the resume
        - Return ONLY a JSON array of question strings, nothing else
        
        Example format: ["Question 1", "Question 2", "Question 3"]
    `;

        // 3. Call the AI
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        // 4. Parse the AI response safely
        const rawText = chatCompletion.choices[0].message.content;

        try {
            questions = JSON.parse(rawText);
        } catch {
            // If AI returns non-JSON, extract manually
            questions = rawText
                .split('\n')
                .filter((line) => line.trim().startsWith('"') || line.trim().match(/^\d+\./))
                .map((line) => line.replace(/^\d+\.\s*/, '').replace(/"/g, '').trim())
                .filter(Boolean);
        }

        // 5. Save to DB so candidate can revisit on dashboard
        const interview = await Interview.create({
            user: userId,
            resume: resumeId,
            jobDescription,
            jobRole,
            questions,
        });

        res.status(201).json({
            message: 'Interview questions generated successfully',
            jobRole,
            totalQuestions: questions.length,
            questions,
            interviewId: interview._id,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Past Interview Sessions for a Candidate
const getCandidateInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.user.id })
            .populate('resume', 'fileName')       // show which resume was used
            .sort({ createdAt: -1 });             // newest first

        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a Single Interview Session 
const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('resume', 'fileName');

        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        // Security: make sure it belongs to the logged-in user
        if (interview.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//  Delete an Interview Session 
const deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        if (interview.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await interview.deleteOne();
        res.status(200).json({ message: 'Interview session deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    generateInterviewQuestions,
    getCandidateInterviews,
    getInterviewById,
    deleteInterview,
};