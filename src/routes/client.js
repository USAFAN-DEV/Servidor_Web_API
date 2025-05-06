//Express
const express = require("express");
const clientRouter = express.Router();
//Controllers
const {
  createClient,
  updateClient,
  getClients,
  getClient,
  archivarCliente,
  deleteCliente,
  getArchivedClients,
  restoreArchivedClient,
} = require("../controllers/clientController.js");
//Validators
const { createClientValidator, updateClientValidator } = require("../validators/clientsValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

//Endpoints

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Crea un nuevo cliente
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cif
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: integer
 *                   postal:
 *                     type: string
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       409:
 *         description: Cliente ya existente
 *       500:
 *         description: Error del servidor
 */
clientRouter.post("/", createClientValidator, authMiddleware, createClient);

/**
 * @swagger
 * /api/client:
 *   patch:
 *     summary: Actualiza un cliente por CIF
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cif
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - number
 *                   - postal
 *                   - city
 *                   - province
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: integer
 *                   postal:
 *                     type: string
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
clientRouter.patch("/", updateClientValidator, authMiddleware, updateClient);

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Obtener todos los clientes del usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       404:
 *         description: No hay clientes
 *       500:
 *         description: Error del servidor
 */
clientRouter.get("/", authMiddleware, getClients);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       400:
 *         description: ID no válido
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
clientRouter.get("/:id", authMiddleware, getClient);

/**
 * @swagger
 * /api/client/{id}:
 *   patch:
 *     summary: Archiva (soft delete) un cliente por ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente archivado correctamente
 *       400:
 *         description: ID no válido
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
clientRouter.patch("/:id", authMiddleware, archivarCliente);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Elimina permanentemente un cliente
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado permanentemente
 *       400:
 *         description: ID no válido
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
clientRouter.delete("/:id", authMiddleware, deleteCliente);

/**
 * @swagger
 * /api/client/archived/list:
 *   get:
 *     summary: Lista los clientes archivados del usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 *       404:
 *         description: No existen clientes archivados
 *       500:
 *         description: Error del servidor
 */
clientRouter.get("/archived/list", authMiddleware, getArchivedClients);

/**
 * @swagger
 * /api/client/restore/{id}:
 *   patch:
 *     summary: Restaura un cliente archivado
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente restaurado correctamente
 *       400:
 *         description: ID de cliente no válido
 *       404:
 *         description: Cliente no encontrado o no está archivado
 *       500:
 *         description: Error del servidor
 */
clientRouter.patch("/restore/:id", authMiddleware, restoreArchivedClient);

module.exports = clientRouter;
