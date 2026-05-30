const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

const resumeRouter = require('./Routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
app.use('/api/interviews', interviewRoutes);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/resumes', resumeRouter);

// DB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error("Error connection :", err));

// Routes
app.get('/', (req, res) => {
    res.send("Recroot API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});