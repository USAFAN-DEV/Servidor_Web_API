//Express
const { matchedData } = require("express-validator");
const { compare } = require("../utils/handlePassword.js");
const loginValidator = require("../validators/loginValidator.js");
const userModel = require("../models/usersModel.js");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Buscamos el usuario
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send("El usuario no existe");
    }

    //Checkeamos que el email haya sido verificado
    if (!user.verificated) {
      return res.status(401).send("El usuario no ha sido verificado. Por favor verifica el correo electronico");
    }

    //Comparamos la contraseña hasheada y la escrita por el usuario
    const encryptedPassword = user.password;
    const correctPassword = await compare(password, encryptedPassword);

    if (!correctPassword) {
      return res.status(403).send("La contraseña introducida es incorrecta");
    }

    return res.status(200).json({ message: "Inicio de sesión completado", user: user }); //TODO DAR JWT
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).send("Error del servidor al hacer login");
  }
};

module.exports = login;
