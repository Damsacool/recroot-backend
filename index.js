require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const authRoutes = require("./Routes/authRoutes");
const resumeRoutes = require('./Routes/resumeRoutes');
const interviewRoutes = require('./Routes/interviewRoutes');
const scoringRoute = require('./Routes/scoringRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use('/resumes', resumeRoutes);
app.use('/interviews', interviewRoutes);
app.use('/scoring', scoringRoute);

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