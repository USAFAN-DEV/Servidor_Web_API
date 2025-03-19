const userModel = require("../models/usersModel.js");
const { matchedData } = require("express-validator");
const { encrypt } = require("../utils/handlePassword.js");
const { createUserVerification } = require("../controllers/userVerificationController.js");

const createUser = async (req, res) => {
  try {
    const body = matchedData(req);

    //Hasheamos la contraseña
    body.password = await encrypt(body.password);

    //Creamos el usuario
    const result = await userModel.create(body);

    //Creamos el userVerification
    const code = await createUserVerification(body.email);

    console.log("Codigo a enviar por correo: ", code);
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
