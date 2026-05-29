const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        extractedText: {
            type: String,
            required: true,
        },
        matchScore: {
            type: Number,
            default: 0,
        },
        feedback: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const ResumeModel = mongoose.model("Resume", resumeSchema);
module.exports = ResumeModel;