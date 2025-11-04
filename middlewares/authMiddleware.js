const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const verifyToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // ✅ Check for "Bearer " and extract token properly
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: Token not provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETS);
      req.user = decoded; // attach user data to request
      console.log("✅ Decoded user:", req.user);
      next();
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: Missing Bearer token" });
  }
};

module.exports = verifyToken;
