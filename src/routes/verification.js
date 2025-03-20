const express = require("express");
const verificationRouter = express.Router();
const verifyUser = require("../controllers/verificationController.js");
const verificationValidator = require("../validators/verificationValidator.js");

verificationRouter.post("/", verificationValidator, verifyUser);

module.exports = verificationRouter;
