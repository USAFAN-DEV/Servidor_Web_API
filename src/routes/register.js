const express = require("express");
const registerRouter = express.Router();
const { createUser, completeUser } = require("../controllers/usersController.js");
const validatorUser = require("../validators/usersValidator.js");
const validatorCompleteUser = require("../validators/completeUserValidator.js");

registerRouter.post("/", validatorUser, createUser);
registerRouter.patch("/", validatorCompleteUser, completeUser);

module.exports = registerRouter;
