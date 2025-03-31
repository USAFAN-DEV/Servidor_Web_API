//Express
const express = require("express");
const userRouter = express.Router();
//Controllers
const { createUser, getUser, completeUser, loginUser } = require("../controllers/userController.js");
//Validators
const registerValidator = require("../validators/users/registerUserValidator.js");
const completeInfoValidator = require("../validators/users/completeUserInfoValidator.js");
const loginValidator = require("../validators/users/loginUserValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

userRouter.post("/register", registerValidator, createUser);

userRouter.patch("/complete-info", completeInfoValidator, authMiddleware, completeUser);

userRouter.post("/login", loginValidator, authMiddleware, loginUser);

userRouter.get("/me", authMiddleware, getUser);

module.exports = userRouter;
