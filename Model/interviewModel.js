const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,                     // which candidate owns this
        },
        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume',
            required: true,                     // which resume was used
        },
        jobDescription: {
            type: String,
            required: true,                     // the pasted job description
        },
        jobRole: {
            type: String,
            default: '',                        // e.g "Frontend Developer"
        },
        questions: {
            type: [String],                     // array of 5–10 AI questions
            default: [],
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);