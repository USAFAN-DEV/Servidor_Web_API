//Express
const { matchedData } = require("express-validator");
const { compare } = require("../utils/handlePassword.js");
const userModel = require("../models/usersModel.js");

/**
 * Login de un usuario. Comprueba los datos introducidos con los datos almacenados
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} req.body - Datos enviados en la solicitud.
 *
 * @param {string} req.body.email - Email del usuario.
 * @param {string} req.body.password - Contraseña del usuario.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} - Devuelve una mensaje de éxito, una respuesta HTTP con la empresa creada o un error.
 */

const login = async (req, res) => {
  try {
    const body = matchedData(req);
    const { email, password } = body;

    //Buscamos el usuario
    const user = await userModel.findOne({ email });

    if (!user) {
      console.log(`\nNo existe usuario con el correo ${email}.`);
      console.log("-".repeat(50));
      return res.status(404).send("El usuario no existe");
    }

    //Checkeamos que el email haya sido verificado
    if (!user.verificated) {
      console.log(`\nEl usuario ${email} no ha sido verificado. No puede iniciar sesion.`);
      console.log("-".repeat(50));
      return res.status(401).send("El usuario no ha sido verificado. Por favor verifica el correo electronico");
    }

    //Comparamos la contraseña hasheada y la escrita por el usuario
    const encryptedPassword = user.password;
    const correctPassword = await compare(password, encryptedPassword);

    if (!correctPassword) {
      console.log(`\nContraseña incorrecta para ${email}.`);
      console.log("-".repeat(50));
      return res.status(403).send("La contraseña introducida es incorrecta");
    }

    console.log(`\nInicio de sesion completado, bienvenido ${user?.name || "Usuario"}.`);
    console.log("-".repeat(50));
    return res.status(201).json({ message: `Inicio de sesión completado. Bienvenido ${user.name}`, result: user }); //TODO DAR JWT
  } catch (error) {
    console.error("\nError en PATCH /api/company. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    return res.status(500).send("Error del servidor al hacer login");
  }
};

module.exports = login;
