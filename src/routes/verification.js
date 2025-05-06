//Express
const express = require("express");
const verificationRouter = express.Router();
//Controllers
const verifyUser = require("../controllers/verificationController.js");
//Validators
const verificationValidator = require("../validators/verificateUserValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

/**
 * @swagger
 * /api/verification:
 *   post:
 *     summary: Verifica un usuario
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
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: "myname@email.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: si el usuario ha sido verificado o si se ha reenviado un código.
 *       400:
 *         description: si el código de verificación es incorrecto.
 *       404:
 *         description: si el usuario no existe.
 *       409:
 *         description: si el usuario ya estaba verificado.
 *       410:
 *         description: si el código ha expirado.
 *       423:
 *         description: si el usuario está bloqueado.
 *       500:
 *         description: si ocurre un error en el servidor.
 *
 */
verificationRouter.post("/", verificationValidator, authMiddleware, verifyUser);

module.exports = verificationRouter;
