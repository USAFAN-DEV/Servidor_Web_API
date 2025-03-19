const express = require("express");
const validationRouter = express.Router();
const send = require("../controllers/mailController.js");
const validationMail = require("../validators/mailValidator.js");

validationRouter.post("/", validationMail, send);

module.exports = validationRouter;
