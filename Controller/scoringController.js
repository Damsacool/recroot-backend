const Groq = require('groq-sdk');
const ResumeModel = require("../Model/resumeModel");
const { getMyResumes } = require("./resumeController");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const scoreResume = async (req, res) => {
    try {
        const { resumeId, jobDescription } = req.body;

        // To check that both fields exist 
        if (!resumeId || !jobDescription) {
            return res.status(400).json({ message: "Both resumeId and jobDescription are required" });
        }

        // To fetch the resume from DB
        const resume = await ResumeModel.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // To build the AI prompt
        const prompt = `
            You are an expert HR recruiter and resume evaluator.

            Evaluate how well the following resume matches the provided job description.

            RESUME: 
            ${resume.extractedText}

            JOB DESCRIPTION:
            ${jobDescription}

            Return only a JSON object in this exact format, nothing else:
            {
                "matchScore": <number between 0 and 100>,
                "matchedSkills": [<Lists of skills the candidate has that match the job>],
                "missingSkills": [<List of skills the job requires that the candidate lacks>],
                "feedback": "<a short paragraph of honest feedback about the candidate's fit>" 
            }
        `;

        // To call the AI
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const rawText = chatCompletion.choices[0].message.content;

        // To clean andparse the response
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const aiResponse = JSON.parse(cleaned);

        // To save results back to the resume document
        resume.matchScore = aiResponse.matchScore;
        getMyResumes.feedBack = aiResponse.feedback;
        await resume.save();

        return res.status(200).json({
            message: "Resume scored successfully",
            data : {
                resumeId: resume._id,
                fileName: resume.fileName,
                matchScore: aiResponse.matchScore,
                matchedSkills: aiResponse.matchedSkills, 
                missingSkills: aiResponse.missingSkills,
                feedback: aiResponse.feedback
            },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { scoreResume };