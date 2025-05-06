//Express
const express = require("express");
const logoRouter = express.Router();
//Controllers
const createItem = require("../controllers/logoController.js");
//Middleware
const authMiddleware = require("../middleware/session.js");
//Utils
const { uploadMiddleware } = require("../utils/handleStorage.js");

/**
 * @swagger
 * /api/logo:
 *   post:
 *     summary: Sube un logo y lo asocia al usuario autenticado
 *     tags:
 *       - Logo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen a subir
 *     responses:
 *       201:
 *         description: Logo creado y asociado al usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *       400:
 *         description: No se ha proporcionado ningún archivo
 *       500:
 *         description: Error del servidor al registrar el logo
 */
logoRouter.post("/", authMiddleware, uploadMiddleware.single("image"), createItem);

module.exports = logoRouter;
