//Express
const { matchedData } = require("express-validator");
//Modelos
const userModel = require("../models/usersModel.js");
//Utils
const { encrypt } = require("../utils/handlePassword.js");
const createUserVerification = require("../utils/handleVerification.js");

const createUser = async (req, res) => {
  /**
   * Registra un nuevo usuario en la base de datos y genera un código de verificación para su correo electrónico.
   *
   * @param {Object} req - Objeto de solicitud HTTP (Request).
   * @param {Object} res - Objeto de respuesta HTTP (Response).
   * @returns {Promise<void>} - No devuelve ningún valor explícito, pero responde con el usuario creado o un error HTTP.
   *
   */
  try {
    const body = matchedData(req);

    //Hasheamos la contraseña
    body.password = await encrypt(body.password);

    //Creamos el usuario
    const result = await userModel.create(body);

    //Creamos el userVerification
    await createUserVerification(body.email);

    res.status(200).json(result);
  } catch (error) {
    if (error.code === 11000) {
      //Email repetido
      console.error("HTTP method: POST, route: /api/register\n. Email repetido\n", error);
      res.status(409).send("El email introducido ya existe. Por favor, introduzca otro email");
    } else {
      console.error("HTTP method: POST, route: /api/register\n. Error del servidor\n", error);
      res.status(500).send("Error del servidor");
    }
  }
};

module.exports = createUser;
