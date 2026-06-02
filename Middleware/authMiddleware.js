const jwt = require("jsonwebtoken");
const UserModel = require("../Model/userModel");

const protect = async (req, res, next) => {
    try {
        // To check if the token is present in the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message : "Not authorized, no token" });
        };

        // To extract the token from the header
        const token = authHeader.split(" ")[1];

        // To verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // To find the user by ID and attach it to the request.
        req.user = await UserModel.findById(decoded.id).select("-password");

        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = protect;