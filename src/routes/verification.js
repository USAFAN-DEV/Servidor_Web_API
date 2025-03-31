//Express
const express = require("express");
const verificationRouter = express.Router();
//Controllers
const verifyUser = require("../controllers/verificationController.js");
//Validators
const verificationValidator = require("../validators/verificateUserValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

verificationRouter.post("/", verificationValidator, authMiddleware, verifyUser);

module.exports = verificationRouter;
