const jwt = require("jsonwebtoken");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        if (!user) {
          res.status(401);
          throw new Error("User not found. Please login again");
        }
        req.user = user;
        next();
      }
    } catch (error) {
      // Set 401 status for token expiration/invalid token
      res.status(401);
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        throw new Error("Authorized token expired, please Login again");
      }
      throw new Error(error.message || "Authorized token expired, please Login again");
    }
  } else {
    res.status(401);
    throw new Error("There is no token attached to header");
  }
});

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

module.exports = { authMiddleware, isAdmin };
