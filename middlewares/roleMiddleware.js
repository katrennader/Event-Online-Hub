const { StatusCodes } = require("http-status-codes");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    //Admin always has full access
    if (req.user.role === "Admin") {
      return next();
    }

    //Otherwise, check if the user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = authorizeRoles;
