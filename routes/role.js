const express = require("express");
const RoleRouter = express.Router();
const { StatusCodes } = require("http-status-codes");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Admin route 
RoleRouter.get("/Admin", verifyToken, authorizeRoles("Admin"), (req, res) => {
  res.status(StatusCodes.OK).json({ message: "Welcome Admin" });
});

//Organizer route
RoleRouter.get("/Organizer", verifyToken, authorizeRoles("Organizer"), (req, res) => {
  res.status(StatusCodes.OK).json({ message: "Welcome Organizer" });
});

// Attendee route 
RoleRouter.get("/Attendee", verifyToken, authorizeRoles("Attendee"), (req, res) => {
  res.status(StatusCodes.OK).json({ message: "Welcome Attendee" });
});


module.exports = RoleRouter;
