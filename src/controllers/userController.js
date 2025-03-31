//Express
const { matchedData } = require("express-validator");
//Modelos
const userModel = require("../models/userModel.js");
//Utils
const { encrypt, compare } = require("../utils/handlePassword.js");
const createUserVerification = require("../utils/handleVerification.js");
const { tokenSign } = require("../utils/handleJWT.js");

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
    result.set("password", undefined, { strict: false }); //Si no queremos que se muestre el hash en la respuesta

    //Creamos el userVerification
    await createUserVerification(body.email);

    const data = {
      token: await tokenSign(result),
      result,
    };

    console.log(`\nUsuario ${body.email} creado.`);
    console.log("-".repeat(50));
    res.status(201).json({ message: "Usuario creado", result: data });
  } catch (error) {
    if (error.code === 11000) {
      //Email repetido
      console.error("\nError en POST /api/register. Email repetido:");
      console.log("-".repeat(50) + "\n", error);
      res.status(409).send("Error. Email repetido. Por favor, utiliza otro email para el registro");
    } else {
      console.error("\nError en POST /api/register. Error del servidor:");
      console.log("-".repeat(50) + "\n", error);
      res.status(500).send("Error del servidor al registrar el usuario");
    }
  }
};

/**
 * Obtiene la información de un usuario existente en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<void>} - Devuelve un mensaje de éxito o un error.
 *
 */

const getUser = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id).populate("logo_id");

    if (!user) {
      console.error("\nError en GET /api/user. No se ha encontrado el usuario:");
      console.log("-".repeat(50));
      return res.status(404).send("El usuario no existe en la base de datos.");
    }

    console.log(`\nUsuario ${user.email} encontrado.`);
    console.log("-".repeat(50));
    res.status(200).json({ message: "Usuario encontrado", result: user });
  } catch (error) {
    console.error("\nError en GET /api/user. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar encontrar el usuario");
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
    const id = req.user._id;
    const body = matchedData(req);

    const result = await userModel.updateOne(
      { _id: id },
      { $set: { name: body.name, surname: body.surname, nif: body.nif } }
    );

    if (result.matchedCount == 0) {
      console.error("\nError en PATCH /api/register. No se ha encontrado el usuario");
      console.log("-".repeat(50));
      return res.status(404).send("El usuario no existe en la base de datos.");
    }

    console.log(`\nInformación del usuario actualizada.`);
    console.log("-".repeat(50));
    res.status(204).json({ message: "Información actualizada", result: result });
  } catch (error) {
    console.error("\nError en PATCH /api/register. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar actualizar la informacion del usuario");
  }
};

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

const loginUser = async (req, res) => {
  try {
    const id = req.user._id;
    const body = matchedData(req);

    //Buscamos el usuario
    const user = await userModel.findById(id);

    if (!user) {
      console.error(`\nError. No existe usuario con el correo ${body.email}.`);
      console.log("-".repeat(50));
      return res.status(404).send("Error. El usuario no existe");
    }

    //Checkeamos que el email haya sido verificado
    if (!user.verificated) {
      console.error(`\nError. El usuario ${user.email} no ha sido verificado. No puede iniciar sesion.`);
      console.log("-".repeat(50));
      return res.status(401).send("Error. El usuario no ha sido verificado. Por favor verifica el correo electronico");
    }

    //Comparamos la contraseña hasheada y la escrita por el usuario
    const encryptedPassword = user.password;
    const correctPassword = await compare(body.password, encryptedPassword);

    if (!correctPassword) {
      console.log(`\nError. Contraseña incorrecta para ${user.email}.`);
      console.log("-".repeat(50));
      return res.status(403).send("Error. La contraseña introducida es incorrecta");
    }

    if (!(body.email === user.email)) {
      console.log(`\nError. Correo incorrecto.`);
      console.log("-".repeat(50));
      return res.status(403).send("Error. El correo introducido es incorrecto");
    }

    console.log(`\nInicio de sesion completado, bienvenido ${user?.name || "Usuario"}.`);
    console.log("-".repeat(50));
    return res.status(201).json({
      message: `Inicio de sesión completado. Bienvenido ${user?.name || "Usuario"}`,
      result: user,
      token: await tokenSign(user),
    });
  } catch (error) {
    console.error("\nError en PATCH /api/company. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    return res.status(500).send("Error del servidor al hacer login");
  }
};

module.exports = { createUser, getUser, completeUser, loginUser };
