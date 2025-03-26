const express = require("express");
const companyRouter = express.Router();
const createCompany = require("../controllers/companyController.js");
const validatorCompany = require("../validators/companyValidator.js");

companyRouter.patch("/", validatorCompany, createCompany);

module.exports = companyRouter;

//TODO dividir en post para crear la empresa, si existe status(400) y patch /:cif para añadir un email a la empresa.
//TODO Si el usuario es autónomo, los datos de la compañía serán sus propios datos personales.
