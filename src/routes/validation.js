const express = require("express");
const validationRouter = express.Router();
const send = require("../controllers/mail.js");
const validationMail = require("../validators/mail.js");

validationRouter.post("/", validationMail, send);

module.exports = validationRouter;
