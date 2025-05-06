const PDFDocument = require("pdfkit");
const streamToBuffer = require("stream-to-buffer");
const uploadToPinata = require("../utils/handleUploadIPFS.js");
const mongoose = require("mongoose");
const { matchedData } = require("express-validator");
const deliveryNoteModel = require("../models/deliveryNoteModel.js");
const clientModel = require("../models/clientModel.js");
const projectModel = require("../models/projectModel.js");

// Crear un nuevo albarán
const createDeliveryNote = async (req, res) => {
  try {
    const user_id = req.user._id;
    const body = matchedData(req);
    body.user_id = user_id; // Asegúrate de asignar el usuario actual a la nota
    const client_id = body.client_id;
    const project_id = body.project_id;

    // Verificar si el cliente existe
    const clientOfAlbaran = await clientModel.findById(client_id);
    if (!clientOfAlbaran) {
      return res.status(404).json({ message: "Cliente no encontrado" }); // Asegúrate de que el mensaje esté aquí
    }

    // Verificar si el proyecto existe
    const projectOfAlbaran = await projectModel.findById(project_id);
    if (!projectOfAlbaran) {
      return res.status(404).json({ message: "Proyecto no encontrado" }); // Asegúrate de que el mensaje esté aquí
    }

    // Crear el albarán con los datos proporcionados
    const result = await deliveryNoteModel.create(body);

    // Responder con éxito
    res.status(201).json({ message: "Albarán creado", result });
  } catch (error) {
    console.error("Error al crear albarán:", error);
    res.status(500).send("Error al crear albarán");
  }
};

const getDeliveryNotes = async (req, res) => {
  try {
    const user_id = req.user._id;

    // Buscar los albaranes del usuario
    const result = await deliveryNoteModel.find({ user_id });

    // Si no se encuentra ningún albarán
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No se encontraron albaranes para este usuario" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener albaranes:", error);
    res.status(500).json({ message: "Error al obtener albaranes", error: error.message });
  }
};

const getDeliveryNote = async (req, res) => {
  try {
    const _id = req.params.id;

    // Verificar si el ID tiene un formato válido
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "ID de albarán inválido" });
    }

    // Buscar el albarán por ID y verificar que pertenece al usuario autenticado
    const result = await deliveryNoteModel
      .findOne({ _id, user_id: req.user._id })
      .populate("user_id")
      .populate("client_id")
      .populate("project_id");

    // Si no se encuentra el albarán
    if (!result) {
      return res.status(404).send("Albarán no encontrado para este usuario");
    }

    // Responder con el albarán encontrado
    res.status(200).json(result);
  } catch (error) {
    // Capturar errores inesperados y enviar un mensaje de error genérico
    console.error(error); // Log para depuración (opcional)
    res.status(500).json({ message: "Error al obtener albarán" });
  }
};

// Descargar PDF
const downloadPDF = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = req.user._id;

    // Verificar si el _id es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "ID de albarán inválido" });
    }

    const note = await deliveryNoteModel
      .findOne({ _id, user_id })
      .populate("project_id")
      .populate("client_id")
      .populate("user_id");

    if (!note) return res.status(404).send("Albarán no encontrado");

    if (note.pdf_url) {
      return res.redirect(note.pdf_url); // Si ya está en la cloud, redirigir
    }

    // Generar PDF si no está en cloud
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const ipfsResponse = await uploadToPinata(pdfBuffer, `albaran_${_id}.pdf`);
      const ipfsURL = `https://gateway.pinata.cloud/ipfs/${ipfsResponse.IpfsHash}`;

      await deliveryNoteModel.findByIdAndUpdate(_id, { pdf_url: ipfsURL });
      res.status(201).json({ message: "PDF creado correctamente", url: ipfsURL });
    });

    // Contenido del PDF
    doc.fontSize(20).text("Albarán", { align: "center" }).moveDown();
    doc.fontSize(14).text(`Cliente: ${note.client_id.name}`);
    doc.text(`CIF: ${note.client_id.cif}`);
    doc.text(`Dirección: ${note.client_id.address.street}, ${note.client_id.address.city}`).moveDown();
    doc.text(`Proyecto: ${note.project_id.name}`);
    doc.text(`Descripción: ${note.project_id.description || "Sin descripción"}`).moveDown();

    doc.fontSize(16).text("Entradas:").fontSize(12);
    note.entries.forEach((entry, i) => {
      if (entry.person) {
        doc.text(`${i + 1}. ${entry.person} - ${entry.hours} horas`);
      } else if (entry.material) {
        doc.text(`${i + 1}. ${entry.material} - ${entry.quantity} unidades`);
      }
    });

    doc.moveDown();

    doc.end();
  } catch (error) {
    console.error("Error descargando PDF:", error);
    res.status(500).send("Error al descargar PDF");
  }
};

// Firmar albarán
const signDeliveryNote = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = req.user._id;

    // Validar formato del ID
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "ID de albarán inválido" });
    }

    const note = await deliveryNoteModel.findOne({ _id, user_id });
    if (!note) return res.status(404).send("Albarán no encontrado");

    if (!req.file) return res.status(400).send("No se subió imagen de firma");

    // Subir firma a IPFS
    const ipfsResponse = await uploadToPinata(req.file.buffer, `firma.png`);
    const signatureURL = `https://gateway.pinata.cloud/ipfs/${ipfsResponse.IpfsHash}`;

    // Actualizar con la firma
    await deliveryNoteModel.findByIdAndUpdate(_id, { signature_url: signatureURL, signed: true });
    res.status(200).json({ message: "Albaran firmado correctamente" });
  } catch (error) {
    console.error("Error al firmar albarán:", error);
    res.status(500).send("Error al firmar albarán");
  }
};

// Borrar albarán (solo si no está firmado)
const deleteDeliveryNote = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = req.user._id;

    const note = await deliveryNoteModel.findOne({ _id, user_id });
    if (!note) return res.status(404).send("Albarán no encontrado");
    if (note.signature_url) return res.status(400).send("No se puede borrar un albarán firmado");

    await deliveryNoteModel.findByIdAndDelete(_id);
    res.status(200).send("Albarán eliminado correctamente");
  } catch (error) {
    res.status(500).send("Error al borrar albarán");
  }
};

module.exports = {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  downloadPDF,
  signDeliveryNote,
  deleteDeliveryNote,
};
