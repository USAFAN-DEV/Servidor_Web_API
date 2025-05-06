const mongoose = require("mongoose");
//Express
const { matchedData } = require("express-validator");
//Modelos
const clientModel = require("../models/clientModel.js");

const createClient = async (req, res) => {
  try {
    const id = req.user._id;
    const body = matchedData(req);

    body.user_id = id;

    // Verifica si ya existe un cliente con el mismo cif para ese usuario
    const existingClient = await clientModel.findOne({ user_id: id, cif: body.cif });
    if (existingClient) {
      console.error("\nError en POST /api/client. Ya existe un cliente con ese CIF para este usuario:");
      console.log("-".repeat(50) + "\n");
      return res.status(409).send("Ya existe un cliente con ese CIF para este usuario.");
    }

    const result = await clientModel.create(body);
    res.status(201).json({ message: "Cliente creado.", result: result });
  } catch (error) {
    console.error("\nError en POST /api/client. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al registrar el cliente");
  }
};

const updateClient = async (req, res) => {
  try {
    const body = matchedData(req);

    // Usamos updateOne con el campo cif
    const result = await clientModel.updateOne(
      { cif: body.cif, user_id: req.user._id }, // Aseguramos que el usuario sea el correcto
      { $set: body }
    );

    if (result.matchedCount === 0) {
      console.error("\nError en PATCH /api/client. No se ha encontrado el cliente");
      console.log("-".repeat(50));
      return res.status(404).send("El cliente no existe en la base de datos.");
    }

    res.status(200).json({ message: "Información actualizada", result: result });
  } catch (error) {
    console.error("\nError en PATCH /api/client. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar actualizar la información del cliente");
  }
};

const getClients = async (req, res) => {
  try {
    const user_id = req.user._id;
    const result = await clientModel.find({ user_id });

    if (result.length === 0) {
      console.error("\nError en GET /api/client. No se encontraron clientes para este usuario:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).json({ message: "No se encontraron clientes para este usuario." });
    }

    res.status(200).json({ message: "Clientes encontrados", result: result });
  } catch (error) {
    console.error("\nError en GET /api/client. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar encontrar los clientes");
  }
};

const getClient = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      console.error("\nError en GET /api/client/:id. ID de cliente no válido:");
      return res.status(400).send("ID de cliente no válido");
    }

    const user_id = req.user._id;
    const result = await clientModel.findOne({
      user_id,
      _id,
      deleted: false, // Filtramos solo los no archivados
    });

    if (!result) {
      console.error("\nError en GET /api/client/:id. No se ha encontrado el cliente:");
      return res.status(404).send("Cliente no encontrado");
    }

    res.status(200).json({ message: "Cliente encontrado", result: result });
  } catch (error) {
    console.error("\nError en GET /api/client/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar encontrar el cliente");
  }
};

const archivarCliente = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      console.error("\nError en PATCH /api/client/:id. ID de cliente no válido:");
      console.log("-".repeat(50) + "\n");
      return res.status(400).send("ID de cliente no válido");
    }

    const user_id = req.user._id;
    const result = await clientModel.delete({ _id, user_id }); // Usamos delete (soft delete)

    if (result.matchedCount === 0) {
      console.error("\nError en PATCH /api/client/:id. Cliente no encontrado:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("Cliente no encontrado");
    }

    res.status(200).json({ message: "Cliente archivado correctamente." });
  } catch (error) {
    console.error("\nError en PATCH /api/client/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar archivar el cliente");
  }
};

const deleteCliente = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      console.error("\nError en DELETE /api/client/:id. ID de cliente no válido:");
      console.log("-".repeat(50) + "\n");
      return res.status(400).send("ID de cliente no válido");
    }

    const user_id = req.user._id;
    const result = await clientModel.deleteOne({ _id, user_id }, { hard: true }); // Hard delete (borrado permanente)

    if (!result.deletedCount) {
      console.error("\nError en DELETE /api/client/:id. Cliente no encontrado:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("Cliente no encontrado");
    }

    res.status(200).json({ message: "Cliente eliminado permanentemente" });
  } catch (error) {
    console.error("\nError en DELETE /api/client/:id. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar eliminar el cliente permanentemente");
  }
};

const getArchivedClients = async (req, res) => {
  try {
    const user_id = req.user._id;
    const result = await clientModel.findDeleted({ user_id, deleted: true });

    if (!result || result.length === 0) {
      console.error("\nError en GET /api/client/archived. No existen clientes archivados:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("No existen clientes archivados");
    }

    res.status(200).json({ message: "Clientes archivados encontrados", result: result });
  } catch (error) {
    console.error("\nError en GET /api/client/archived. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al buscar los clientes archivados");
  }
};

const restoreArchivedClient = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      console.error("\nError en PATCH /api/client/restore/:id. ID de cliente no válido:");
      console.log("-".repeat(50) + "\n");
      return res.status(400).send("ID de cliente no válido");
    }

    const user_id = req.user._id;

    // Restauramos el cliente
    const result = await clientModel.restore({ _id, user_id });

    if (result.matchedCount === 0) {
      console.error("\nError en PATCH /api/client/restore/:id. Cliente no encontrado o no archivado:");
      console.log("-".repeat(50) + "\n");
      return res.status(404).send("Cliente no encontrado o no está archivado");
    }

    res.status(200).json({ message: "Cliente restaurado correctamente." });
  } catch (error) {
    console.error("\nError en PATCH /api/client/restore/:id. Error del servidor:");
    console.log("-".repeat(50), "\n", error);
    res.status(500).send("Error del servidor al intentar restaurar el cliente");
  }
};

module.exports = {
  createClient,
  updateClient,
  getClients,
  getClient,
  archivarCliente,
  deleteCliente,
  getArchivedClients,
  restoreArchivedClient,
};
