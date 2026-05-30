const Interview = require('../models/interviewModel');
const Resume = require('../models/resumeModel');
const { OpenAI } = require('openai');                

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
            You are an expert technical interviewer.
            
            A candidate is applying for the role of: "${jobRole}".
            
            Here is their resume content:
            "${resume.extractedText}"
            
            Here is the job description they are applying for:
            "${jobDescription}"
            
            Based on the resume and job description:
            - Generate 5 to 10 relevant interview questions
            - Mix technical, behavioral, and role-specific questions
            - Focus on gaps between the resume and the job requirements
            - Return ONLY a JSON array of question strings, nothing else
            
            Example format: ["Question 1", "Question 2", "Question 3"]
        `;

        // 3. Call the AI
        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        // 4. Parse the AI response safely
        const rawText = aiResponse.choices[0].message.content;
        let questions = [];

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