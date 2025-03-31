const express = require("express");
const companyRouter = express.Router();
//Controllers
const { createCompany, addUserToCompany, getCompany } = require("../controllers/companyController.js");
//Validators
const createCompanyValidator = require("../validators/company/createCompanyValidator.js");
const addUserToCompanyValidator = require("../validators/company/addUserToCompanyValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

companyRouter.put("/create-company", createCompanyValidator, authMiddleware, createCompany);

companyRouter.patch("/add-user-company", addUserToCompanyValidator, authMiddleware, addUserToCompany);

companyRouter.get("/my-company", authMiddleware, getCompany);

module.exports = companyRouter;
