require("dotenv").config();
const { verifyToken } = require("../helper/authFunction");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(400)
      .json({ message: "Token is missing. Access Denied." });
  }

  try {
    const decoded = verifyToken(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const requireSpecialAccess = (req, res, next) => {
  if (!req.user || req.user.hasAccess !== true) {
    return res.status(403).json({
      message: "Special code verification required to access this resource.",
    });
  }
  next();
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireSpecialAccess = requireSpecialAccess;
