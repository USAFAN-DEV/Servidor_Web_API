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

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registerUser'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       409:
 *         description: El correo electrónico ya esta siendo utilizado
 *       500:
 *         description: Error del servidor
 */
userRouter.post("/register", registerValidator, createUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login de un usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "miemail@gmail.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Inicia de sesión completado
 *       401:
 *         description: El usuario no ha verificado el correo electrónico
 *       403:
 *         description: Contraseña incorrecta
 *       404:
 *         description: No existe un usuario con ese correo electrónico
 *       500:
 *         description: Error del servidor
 */
userRouter.post("/login", loginValidator, loginUser);

/**
 * @swagger
 * /api/user/complete-info:
 *   patch:
 *     summary: Completar la información de un usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - nif
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pepito"
 *               surname:
 *                 type: string
 *                 example: "Graullera"
 *               nif:
 *                 type: string
 *                 example: "1234567Z"
 *     responses:
 *       200:
 *         description: Información de usuario actualizada correctamente
 *       403:
 *         description: Autorización requerida
 *       500:
 *         description: Error del servidor
 */
userRouter.patch("/complete-info", completeInfoValidator, authMiddleware, completeUser);

//Obtener mi usaurio: GET /api/user/me
/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Obtener la información de el usuario actual
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       403:
 *         description: Autorización requerida
 *       500:
 *         description: Error del servidor
 */
userRouter.get("/me", authMiddleware, getUser);

module.exports = userRouter;
