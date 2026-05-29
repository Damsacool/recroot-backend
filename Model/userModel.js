const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const recrootSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false, // won't be returned in queries by default
    },
    role: {
        type: String,
        enum: ["recruiter", "candidate", "admin"],
        default: "candidate", 
    },
    profilePicture: {
        type: String,
        default: " ",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt automatically
});


// Hash password before saving
recrootSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // only hash if password changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
}
);

// Method to compare passwords at login
recrootSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", recrootSchema);

module.exports = User;