//Express
const express = require("express");
const projectRouter = express.Router();
//Controllers
const {
  createProject,
  updateProject,
  getProjects,
  getProject,
  archiveProject,
  deleteProject,
  getArchivedProjects,
  restoreArchivedProject,
} = require("../controllers/projectController.js");
//Validators
const { createProjectValidator, updateProjectValidator } = require("../validators/projectValidator.js");
//Middleware
const authMiddleware = require("../middleware/session.js");

//Endpoints

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectCode
 *               - client_id
 *             properties:
 *               name:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               client_id:
 *                 type: string
 *                 format: uuid
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
 *         description: Proyecto creado
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: Proyecto duplicado
 *       500:
 *         description: Error del servidor
 */
projectRouter.post("/", createProjectValidator, authMiddleware, createProject);

/**
 * @swagger
 * /api/project/{id}:
 *   patch:
 *     summary: Actualiza un proyecto existente
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
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
 *         description: Proyecto actualizado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error del servidor
 */
projectRouter.patch("/:id", updateProjectValidator, authMiddleware, updateProject);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Obtener todos los proyectos del usuario autenticado
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *       404:
 *         description: No se encontraron proyectos
 *       500:
 *         description: Error del servidor
 */
projectRouter.get("/", authMiddleware, getProjects);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto específico
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error del servidor
 */
projectRouter.get("/:id", authMiddleware, getProject);

/**
 * @swagger
 * /api/project/archive/{id}:
 *   patch:
 *     summary: Archivar un proyecto (soft delete)
 *     tags: [Project]
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
 *         description: Proyecto archivado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error del servidor
 */
projectRouter.patch("/archive/:id", authMiddleware, archiveProject);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (hard delete)
 *     tags: [Project]
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
 *         description: Proyecto eliminado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error del servidor
 */
projectRouter.delete("/:id", authMiddleware, deleteProject);

/**
 * @swagger
 * /api/project/archived/list:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 *       404:
 *         description: No hay proyectos archivados
 *       500:
 *         description: Error del servidor
 */
projectRouter.get("/archived/list", authMiddleware, getArchivedProjects);

/**
 * @swagger
 * /api/project/restore/{id}:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Project]
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
 *         description: Proyecto restaurado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Proyecto no encontrado o no archivado
 *       500:
 *         description: Error del servidor
 */
projectRouter.patch("/restore/:id", authMiddleware, restoreArchivedProject);

module.exports = projectRouter;
