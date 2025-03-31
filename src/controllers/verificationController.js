// Modelos
const userModel = require("../models/userModel.js");
const verificationModel = require("../models/verificationModel.js");
// Utils
const generateVerificationCode = require("../utils/handleCode.js");
const createUserVerification = require("../utils/handleVerification.js");
const send = require("../utils/handleEmail.js");
const { matchedData } = require("express-validator");
const { createUser } = require("./userController.js");
// Constantes
const SUBJECT = "Codigo de verificacion";
const FROM = "nicolasgraullera@gmail.com";

/**
 * Función para bloquear al usuario después de superar el número máximo de intentos.
 * @param {string} email - El correo electrónico del usuario a bloquear.
 * @throws {Error} Si ocurre un error al bloquear al usuario en la base de datos.
 */
const blockUser = async (email) => {
  // Establecemos que el usuario quedará bloqueado por 24 horas
  const blockedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const blocked = true;

  try {
    // Actualizamos el estado del usuario en el modelo de verificación
    await verificationModel.updateOne({ email }, { $set: { blocked, blockedExpiresAt } });
  } catch (error) {
    // En caso de error en la actualización, lo capturamos y lo mostramos
    console.error("Error al bloquear al usuario:", error);
    throw new Error("Error al bloquear al usuario.");
  }
};

/**
 * Función que se ejecuta cuando el tiempo de bloqueo ha expirado.
 * @param {string} email - El correo electrónico del usuario cuyo bloqueo ha expirado.
 * @throws {Error} Si ocurre un error al actualizar el estado del bloqueo.
 */
const blockTimeExpired = async (email) => {
  const blocked = false;
  const attemps = 0;

  // Buscamos la entrada de verificación para obtener el valor de maxAttemps
  const verificationEntry = await verificationModel.findOne({ email });
  let maxAttemps = verificationEntry.maxAttemps !== 1 ? verificationEntry.maxAttemps - 1 : 1;

  try {
    // Actualizamos los valores en el modelo de verificación: bloqueado a false, intentos a 0, y maxAttemps ajustado
    await verificationModel.updateOne(
      { email },
      { $set: { blocked, attemps, maxAttemps } },
      { $unset: { blockedExpiresAt: "" } } // Eliminamos la fecha de expiración del bloqueo
    );
  } catch (error) {
    // Si ocurre un error durante la actualización, lo mostramos
    console.error("Error al actualizar el estado de bloqueo del usuario:", error);
    throw new Error("Error al actualizar el estado de bloqueo.");
  }
};

/**
 * Función que se ejecuta cuando el código de verificación ha expirado.
 * @param {string} email - El correo electrónico del usuario cuyo código ha expirado.
 * @throws {Error} Si ocurre un error al actualizar el código de verificación en la base de datos.
 */
const codeExpired = async (email) => {
  // Generamos un nuevo código de verificación
  const code = generateVerificationCode().toString();
  // Establecemos que el código expirará en 15 minutos
  const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  try {
    // Actualizamos el código y la fecha de expiración en el modelo de verificación
    await verificationModel.updateOne({ email }, { $set: { code, codeExpiresAt }, $inc: { attemps: 1 } });
    const emailOptions = {
      subject: SUBJECT,
      text: code,
      to: email,
      from: FROM,
    };
    await send(emailOptions);
  } catch (error) {
    // Si hay un error al actualizar el código, lo mostramos
    console.error("Error al actualizar el código de verificación:", error);
    throw new Error("Error al actualizar el código de verificación.");
  }
};

/**
 * Verifica el usuario a partir del código de verificación enviado por correo electrónico.
 * Si el usuario ya está verificado, bloqueado o el código es incorrecto o ha expirado, maneja cada caso adecuadamente.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos enviados en la solicitud.
 * @param {string} req.body.email - Email del usuario a verificar.
 * @param {string} req.body.code - Código de verificación enviado al usuario.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} - Devuelve una respuesta HTTP indicando el resultado de la verificación.
 *                                - 200 si el usuario ha sido verificado o si se ha reenviado un código.
 *                                - 400 si el código de verificación es incorrecto.
 *                                - 404 si el usuario no existe.
 *                                - 409 si el usuario ya estaba verificado.
 *                                - 410 si el código ha expirado.
 *                                - 423 si el usuario está bloqueado.
 *                                - 500 si ocurre un error en el servidor.
 */
const verifyUser = async (req, res) => {
  const { email, code } = matchedData(req);
  try {
    const verificationEntry = await verificationModel.findOne({ email });
    const userEntry = await userModel.findOne({ email });

    if (!userEntry) {
      console.error("\nError. Usuario no encontrado:", email);
      console.log("-".repeat(50));
      return res.status(404).send("Error. El usuario no existe.");
    }
    if (userEntry.verificated) {
      console.error("\nError. Usuario ya verificado:", email);
      console.log("-".repeat(50));
      return res.status(409).send("Error. El usuario ya está verificado");
    }

    if (!verificationEntry) {
      console.error("\nError. No existe entrada de verificación para el usuario:", email);
      console.log("-".repeat(50));
      await createUserVerification(email);
      return res.status(200).send("Código enviado al correo. Intente verificar el usuario ahora.");
    }

    if (verificationEntry.blocked) {
      console.error("\nError. Usuario bloqueado:", email);
      console.log("-".repeat(50));
      if (verificationEntry.blockedExpiresAt < new Date()) {
        console.log("\nDesbloqueando usuario:", email);
        console.log("-".repeat(50));
        await blockTimeExpired(email);
        await verificationModel.deleteOne({ email });
        await createUserVerification(email);
        return res.status(200).send("Bloqueo eliminado. Intente verificar nuevamente.");
      }
      return res.status(423).send("Error. Usuario bloqueado.");
    }

    if (verificationEntry.attemps >= verificationEntry.maxAttemps) {
      console.error("\nError. Máximo número de intentos alcanzado para:", email);
      console.log("-".repeat(50));
      await blockUser(email);
      return res.status(423).send("Error. Usuario bloqueado.");
    }

    if (verificationEntry.codeExpiresAt < new Date()) {
      console.error("\nError. Código expirado para usuario:", email);
      console.log("-".repeat(50));
      await codeExpired(email);
      return res.status(410).send("Código expirado. Se ha enviado uno nuevo.");
    }

    if (verificationEntry.code !== code) {
      console.error("\nError. Código incorrecto para usuario:", email);
      console.log("-".repeat(50));
      await verificationModel.updateOne({ email }, { $inc: { attemps: 1 } });
      return res.status(400).send("Código incorrecto, intente nuevamente.");
    }

    console.log("\nUsuario verificado exitosamente:", email);
    console.log("-".repeat(50));
    await userModel.updateOne({ email }, { $set: { verificated: true } });
    await verificationModel.deleteOne({ email });
    return res.status(200).send("Usuario verificado.");
  } catch (error) {
    console.error("Error del servidor al verificar al usuario:", email, error);
    return res.status(500).send("Error del servidor.");
  }
};

module.exports = verifyUser;
