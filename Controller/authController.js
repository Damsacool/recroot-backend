const UserModel = require("../Model/userModel");
const jwt = require("jsonwebtoken");

// To signup
const signup = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // To create a new user
        const user = await UserModel.create({ fullName, email, password, role });

        return res.status(201).json({ 
            message: "Account created succesfully",
        data: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message})
  } 
};

// To login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // To use the matchPassword method from userModel to compare the password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // To generate a JWT token
        const token = jwt.sign(
            { id : user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
    
module.exports = { signup, login };