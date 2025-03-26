//Express
const { matchedData } = require("express-validator");
//Modelos
const userModel = require("../models/usersModel.js");
//Utils
const { encrypt } = require("../utils/handlePassword.js");
const createUserVerification = require("../utils/handleVerification.js");

/**
 * Registra un nuevo usuario en la base de datos y crea un documento en `userverifications`
 * para gestionar la verificación del usuario.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} req.body - Datos enviados en la solicitud.
 *
 * @param {string} req.body.email - Email del usuario.
 * @param {string} req.body.password - Contraseña del usuario.
 * Además, puede recibir otros valores opcionales
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} - Devuelve una respuesta HTTP con el usuario creado o un error.
 */
const createUser = async (req, res) => {
  try {
    const body = matchedData(req);

    //Hasheamos la contraseña
    body.password = await encrypt(body.password);

    //Creamos el usuario
    const result = await userModel.create(body);

    //Creamos el userVerification
    await createUserVerification(body.email);

    console.log(`\nUsuario ${body.email} creado.`);
    console.log("-".repeat(50));
    res.status(201).json({ message: "Usuario creado", result: result });
  } catch (error) {
    if (error.code === 11000) {
      //Email repetido
      console.error("\nError en POST /api/register. Email repetido:");
      console.log("-".repeat(50) + "\n", error);
      res.status(409).send("Email repetido. Por favor, utiliza otro email para el registro");
    } else {
      console.error("\nError en POST /api/register. Error del servidor:");
      console.log("-".repeat(50) + "\n", error);
      res.status(500).send("Error del servidor al registrar el usuario");
    }
  }
};

/**
 * Completa la información de un usuario existente en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} req.body - Datos enviados en la solicitud.
 *
 * @param {string} req.body.email - Email del usuario.
 * @param {string} req.body.name - Nombre del usuario.
 * @param {string} req.body.surname - Apellidos del usuario.
 * @param {string} req.body.nif - NIF del usuario.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<void>} - Devuelve un mensaje de exito o o un error.
 *
 */
const completeUser = async (req, res) => {
  try {
    const body = matchedData(req);
    const { email, name, surname, nif } = body;
    const result = await userModel.updateOne({ email }, { $set: { name, surname, nif } });

    if (result.matchedCount == 0) {
      console.error("\nError en PATCH /api/register. No se ha encontrado el usuario");
      console.log("-".repeat(50));
      return res.status(404).send("No se ha encontrado el usuario. Revisa el correo electrónico introducido");
    }

    console.log(`\nInformación del usuario ${email} actualizada.`);
    console.log("-".repeat(50));
    res.status(204).send("Información actualizada");
  } catch (error) {
    console.error("\nError en PATCH /api/register. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al registrar el usuario");
  }
};

module.exports = { createUser, completeUser };
