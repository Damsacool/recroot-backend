const ResumeModel = require("../Model/resumeModel");
const pdfParse = require("pdf-parse");

// To upload resume and save it
const uploadResume = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        const pdfData = await pdfParse(req.file.buffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim() === "") {
            return res.status(400).json({ message: "Could not extract text from file" });
        }

        const resume = await ResumeModel.create({
            userId,
            fileName: req.file.originalname,
            extractedText,
        });

        return res.status(201).json({
            message: "Resume uploaded successfully",
            data: resume,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
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

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        return res.status(200).json({
            message: "Resume found",
            data: resume,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
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
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    uploadResume,
    getMyResumes,
    getOneResume,
    deleteResume,
};