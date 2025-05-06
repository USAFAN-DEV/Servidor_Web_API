const mongoose = require("mongoose");
//Express
const { matchedData } = require("express-validator");
//Modelos
const projectModel = require("../models/projectModel.js");
const clientModel = require("../models/clientModel.js");

const createProject = async (req, res) => {
  try {
    const user_id = req.user._id;
    const body = matchedData(req);
    const client_id = body.client_id;

    const clientOfProject = await clientModel.findById(client_id);

    if (!clientOfProject) {
      console.error("\nError en POST /api/project. El cliente del proyecto no existe.");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("El cliente del proyecto no existe.");
    }

    // Verificar que el proyecto no exista ya para ese usuario y cliente
    const existingProject = await projectModel.findOne({
      user_id,
      client_id: body.client_id,
      projectCode: body.projectCode,
    });
    if (existingProject) {
      console.error("\nError en POST /api/project. Ya existe un proyecto con ese código para este usuario.");
      console.log("-".repeat(50) + "\n");
      return res.status(409).send("Ya existe un proyecto con ese código para este usuario.");
    }

    body.user_id = user_id;
    const result = await projectModel.create(body);
    res.status(201).json({ message: "Proyecto creado.", result });
  } catch (error) {
    console.error("\nError en POST /api/project. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al registrar el proyecto");
  }
};

// Actualizar un proyecto
const updateProject = async (req, res) => {
  try {
    const _id = req.params.id;
    const body = matchedData(req);
    const user_id = req.user._id;

    // Verificar si el proyecto existe
    const project = await projectModel.findOne({ _id, user_id });
    if (!project) {
      console.error("\nError en PATCH /api/project. No se ha encontrado el proyecto.");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("No se ha encontrado el proyecto.");
    }

    // Actualizar proyecto
    const result = await projectModel.updateOne({ _id, user_id }, { $set: body });

    res.status(200).json({ message: "Proyecto actualizado", result: result });
  } catch (error) {
    console.error("\nError en PATCH /api/project. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al actualizar el proyecto");
  }
};

// Obtener todos los proyectos de un usuario
const getProjects = async (req, res) => {
  try {
    const user_id = req.user._id;

    const result = await projectModel.find({ user_id });
    if (!result || result.length === 0) {
      console.error("\nError en GET /api/project. No se encontraron proyectos para este usuario.");
      console.log("-".repeat(50) + "\n");
      return res.status(404).json({ message: "No se encontraron proyectos para este usuario." });
    }

    res.status(200).json({ message: "Proyectos encontrados", result });
  } catch (error) {
    console.error("\nError en GET /api/project. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al buscar los proyectos.");
  }
};

// Obtener un proyecto específico
const getProject = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = req.user._id;

    const result = await projectModel.findOne({ _id, user_id });
    if (!result) {
      console.error("\nError en GET /api/project/:id. No se ha encontrado el proyecto.");
      console.log("-".repeat(50) + "\n");
      return res.status(404).json({ message: "No se ha encontrado el proyecto." });
    }

    res.status(200).json({ message: "Proyecto encontrado", result: result });
  } catch (error) {
    console.error("\nError en GET /api/project/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al buscar el proyecto.");
  }
};

// Archivar (soft delete) un proyecto
const archiveProject = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = req.user._id;

    const result = await projectModel.delete({ _id, user_id });

    if (result.matchedCount === 0) {
      console.error("\nError en PATCH /api/project/:id. Proyecto no encontrado:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("Proyecto no encontrado");
    }

    res.status(200).json({ message: "Proyecto archivado correctamente." });
  } catch (error) {
    console.error("\nError en GET /api/project/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al archivar el proyecto.");
  }
};

// Eliminar un proyecto (hard delete)
const deleteProject = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = req.user._id;

    const result = await projectModel.deleteOne({ _id, user_id });

    if (!result.deletedCount) {
      console.error("\nError en DELETE /api/project/:id. Proyecto no encontrado:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("Proyecto no encontrado");
    }

    res.status(200).json({ message: "Proyecto eliminado permanentemente" });
  } catch (error) {
    console.error("\nError en DELETE /api/project/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al eliminar el proyecto.");
  }
};

// Listar proyectos archivados
const getArchivedProjects = async (req, res) => {
  try {
    const user_id = req.user._id;
    const result = await projectModel.findDeleted({ user_id, deleted: true });

    if (result.length === 0) {
      console.error("\nError en GET /api/project/archived. No existen proyectos archivados:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("No existen proyectos archivados.");
    }

    res.status(200).json({ message: "Proyectos archivados encontrados", result: result });
  } catch (error) {
    console.error("\nError en GET /api/project/archived. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al buscar los proyectos archivados.");
  }
};

// Restaurar un proyecto archivado
const restoreArchivedProject = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      console.error("\nError en PATCH /api/project/restore/:id. ID de projecto no válido:");
      console.log("-".repeat(50) + "\n");
      return res.status(400).send("ID de projecto no válido.");
    }

    const user_id = req.user._id;

    const result = await projectModel.restore({ _id, user_id });

    if (result.matchedCount === 0) {
      console.error("\nError en PATCH /api/project/restore/:id. Proyecto no encontrado o no archivado:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("Proyecto no encontrado o no está archivado");
    }

    res.status(200).json({ message: "Proyecto restaurado correctamente." });
  } catch (error) {
    console.error("\nError en GET /api/project/restore/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al restaurar el proyecto archivado.");
  }
};

module.exports = {
  createProject,
  updateProject,
  getProjects,
  getProject,
  archiveProject,
  deleteProject,
  getArchivedProjects,
  restoreArchivedProject,
};
