const ResumeModel = require("../Model/resumeModel");
const pdfParse = require("pdf-parse");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// To upload resume and save it
const uploadResume = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        // Extract text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim() === "") {
            return res.status(400).json({ message: "Could not extract text from file" });
        }

        // To upload file to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    folder: "recroot/resumes",
                    public_id: `${userId}_${Date.now()}`,
                    format: "pdf",
                    access_mode: "public",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const resume = await ResumeModel.create({
            userId,
            fileName: req.file.originalname,
            fileUrl: uploadResult.secure_url,
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