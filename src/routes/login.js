const express = require("express");
const loginRouter = express.Router();

const loginValidator = require("../validators/loginValidator.js");
const login = require("../controllers/loginController.js");

loginRouter.post("/", loginValidator, login);

module.exports = loginRouter;
