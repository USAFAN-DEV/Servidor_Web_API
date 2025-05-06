//Modelos
const LogoModel = require("../models/logoModel.js");
const UserModel = require("../models/userModel.js");
//Utils

/**
 * Crea un nuevo logo y lo asocia a un usuario en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.user - Usuario autenticado que realiza la solicitud.
 * @param {Object} req.file - Archivo de imagen cargado en la solicitud.
 * @param {string} req.file.filename - Nombre del archivo cargado.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} - Devuelve una respuesta HTTP con el resultado de la operación:
 *                                - 201 si el logo se crea y asocia correctamente al usuario.
 *                                - 404 si el usuario no se encuentra.
 *                                - 500 si ocurre un error en el servidor.
 */
const createItem = async (req, res) => {
  try {
    const id = req.user._id;
    const { file } = req;

    // Validación: ¿Se subió un archivo?
    if (!file) {
      return res.status(400).json({ error: "Debes subir un archivo de imagen." });
    }

    const fileData = {
      filename: file.filename,
      url: process.env.PUBLIC_URL + "/public/" + file.filename,
    };

    // Guardar en la colección de logos
    const data = await LogoModel.create(fileData);

    // Asignar el logo al usuario
    const updateUser = await UserModel.findByIdAndUpdate(id, { $set: { logo_id: data._id } }, { new: true });

    /*
    !No hace falta
    if (!updateUser) {
      // El usuario no existe
      console.error("\nError en POST /api/logo. Usuario no encontrado.");
      console.log("-".repeat(50));
      return res.status(404).json({ error: "No se ha podido añadir el logo al usuario." });
    }*/

    console.log(`\nLogo ${data.filename} creado y añadido al usuario ${updateUser.email}.`);
    console.log("-".repeat(50));
    return res.status(201).json({ message: "Logo creado", result: data });
  } catch (error) {
    console.error("\nError en POST /api/logo. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    return res.status(500).json({ error: "Error del servidor al registrar el logo" });
  }
};

module.exports = createItem;
