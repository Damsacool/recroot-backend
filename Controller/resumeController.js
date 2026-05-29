const ResumeModel = require("../Model/resumeModel");

// To upload resume and save it
const uploadResume = async (req, res) => {
    try {
        const { extractedText } = req.body;
        const userId = req.user._id; 

        const resume = await ResumeModel.create({
            userId,
            fileName: req.file.originalname, extractedText,
        });

        return res.status(201).json({
            message: "Resume uploaded successfully",
            data: resume,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message});
    }
};

// To get all resumes of a user
const getMyResumes = async (req, res) => {
    try {
        const userId = req.user._id;
        const resumes = await ResumeModel.find({ userId });

        return res.status(200).json({
            message: "Your resume(s)",
            data: resumes,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// To get one resume by id
const getOneResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await ResumeModel.findById(id);

        return res.status(200).json({
            message: "Resume found",
            data: resume,
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message });
    }
};

const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        await ResumeModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Resume deleted",
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message });
    }
};

module.exports = {
    uploadResume,
    getMyResumes,
    getOneResume,
    deleteResume,
};