// Express
const express = require("express");
const deliveryNoteRouter = express.Router();

// Controllers
const {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  downloadPDF,
  signDeliveryNote,
  deleteDeliveryNote,
} = require("../controllers/deliveryNoteControllers.js");

// Validators
const { createDeliveryNoteValidator } = require("../validators/deliveryNoteValidator.js");

// Middleware
const authMiddleware = require("../middleware/session.js");
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     tags:
 *       - DeliveryNote
 *     summary: Crear un nuevo albarán
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - client_id
 *               - format
 *               - entries
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del proyecto
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del cliente
 *               format:
 *                 type: string
 *                 enum: [hours, materials, mixed]
 *                 description: Tipo de formato de entradas
 *               entries:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   oneOf:
 *                     - required: [person, hours]
 *                       properties:
 *                         person:
 *                           type: string
 *                         hours:
 *                           type: number
 *                     - required: [material, quantity]
 *                       properties:
 *                         material:
 *                           type: string
 *                         quantity:
 *                           type: number
 *     responses:
 *       201:
 *         description: Albarán creado
 *       400:
 *         description: Validación fallida
 *       404:
 *         description: Cliente o proyecto no encontrado
 *       500:
 *         description: Error interno
 */
deliveryNoteRouter.post("/", createDeliveryNoteValidator, authMiddleware, createDeliveryNote);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     tags:
 *       - DeliveryNote
 *     summary: Obtener todos los albaranes del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *       404:
 *         description: No se encontraron albaranes
 *       500:
 *         description: Error al obtener albaranes
 */
deliveryNoteRouter.get("/", authMiddleware, getDeliveryNotes);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     tags:
 *       - DeliveryNote
 *     summary: Obtener detalles de un albarán específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos del albarán
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error interno
 */
deliveryNoteRouter.get("/:id", authMiddleware, getDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     tags:
 *       - DeliveryNote
 *     summary: Descargar o generar PDF del albarán
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redirección al PDF si ya está generado
 *       201:
 *         description: PDF generado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error al generar PDF
 */
deliveryNoteRouter.get("/pdf/:id", authMiddleware, downloadPDF);

/**
 * @swagger
 * /api/deliverynote/sign/{id}:
 *   post:
 *     tags:
 *       - DeliveryNote
 *     summary: Firmar albarán subiendo una imagen de la firma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - signature
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       400:
 *         description: ID inválido o falta imagen de firma
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error al firmar albarán
 */
deliveryNoteRouter.post("/sign/:id", authMiddleware, uploadMiddlewareMemory.single("signature"), signDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     tags:
 *       - DeliveryNote
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       400:
 *         description: Albarán firmado, no se puede borrar
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error al borrar albarán
 */
deliveryNoteRouter.delete("/:id", authMiddleware, deleteDeliveryNote);

module.exports = deliveryNoteRouter;
