const express = require("express");
const companyRouter = express.Router();
//Controllers
const { createCompany, addUserToCompany, getCompany } = require("../controllers/companyController.js");
//Validators
const createCompanyValidator = require("../validators/company/createCompanyValidator.js");
const addUserToCompanyValidator = require("../validators/company/addUserToCompanyValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

/**
 * @swagger
 * /api/company/create-company:
 *   post:
 *     summary: Crea una nueva empresa
 *     tags:
 *       - Company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boss
 *               - company
 *             properties:
 *               boss:
 *                 type: string
 *                 format: email
 *                 example: "jefeempresa@gmail.com"
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["empleado1@gmail.com", "empleado2@gmail.com"]
 *               company:
 *                 type: object
 *                 required:
 *                   - name
 *                   - cif
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Nombre S.A."
 *                   cif:
 *                     type: string
 *                     example: "B12345678"
 *                   street:
 *                     type: string
 *                     example: "Calle Falsa"
 *                   number:
 *                     type: integer
 *                     example: 123
 *                   postal:
 *                     type: string
 *                     example: "28080"
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   province:
 *                     type: string
 *                     example: "Madrid"
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
 *       404:
 *         description: El jefe (boss) no existe
 *       409:
 *         description: El CIF de la empresa ya está registrado
 *       500:
 *         description: Error del servidor
 */
companyRouter.put("/create-company", createCompanyValidator, authMiddleware, createCompany);

/**
 * @swagger
 * /api/company/add-user-company:
 *   patch:
 *     summary: Añade un usuario a una empresa
 *     tags:
 *       - Company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cif
 *               - employees
 *             properties:
 *               cif:
 *                 type: string
 *                 example: "B12345678"
 *                 minLength: 8
 *                 maxLength: 9
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["empleado1@gmail.com", "empleado2@gmail.com"]
 *     responses:
 *       200:
 *         description: si los empleados fueron añadidos correctamente o todos los empleados ya estaban registrados en la empresa.
 *       403:
 *         description: si el usuario que hace la solicitud no es el jefe de la empresa.
 *       404:
 *         description: si la empresa no existe en la base de datos o si algunos empleados no existen en la base de datos.
 *       500:
 *         description: Error del servidor
 */
companyRouter.patch("/add-user-company", addUserToCompanyValidator, authMiddleware, addUserToCompany);

/**
 * @swagger
 * /api/company/my-company:
 *   get:
 *     summary: Obtiene la información de una empresa por su CIF
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cif
 *         required: true
 *         schema:
 *           type: string
 *         description: CIF de la empresa a consultar
 *     responses:
 *       200:
 *         description: Empresa encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Empresa encontrada
 *                 result:
 *                   type: object
 *                   description: Datos de la empresa
 *       400:
 *         description: Error. No se proporcionó el CIF
 *       403:
 *         description: Acceso denegado. Solo el jefe puede ver la empresa
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error del servidor
 */
companyRouter.get("/my-company", authMiddleware, getCompany);

module.exports = companyRouter;
