const userModel = require("../models/users.js");
const mongoose = require("mongoose");
const { matchedData } = require("express-validator");
const crypto = require("crypto");
const { encrypt } = require("../utils/handlePassword.js");

const createUser = async (req, res) => {
  try {
    const body = matchedData(req);

    //Generamos el código de verificación
    const code = generateCode();
    body.code = code;

    //Hasheamos la contraseña
    body.password = await encrypt(body.password);

    //Creamos el usuario
    const result = await userModel.create(body);
    res.status(200).json(result);
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        "HTTP method: POST, route: /api/register\n. Email repetido\n",
        error
      );
      res
        .status(400)
        .send(
          "El email introducido ya existe. Por favor, introduzca otro email"
        );
    } else {
      console.error(
        "HTTP method: POST, route: /api/register\n. Error del servidor\n",
        error
      );
      res.status(500).send("Error del servidor");
    }
  }
};

const generateCode = () => {
  const codigo = crypto.randomInt(100000, 1000000); // Genera un número entre 100000 y 999999
  return codigo;
};

module.exports = createUser;
