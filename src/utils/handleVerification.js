//Modelos
const userVerificationModel = require("../models/verificationModel.js");
//Utils
const { send } = require("../utils/handleEmail.js");
const generateVerificationCode = require("../utils/handleCode.js");
//Constantes
const SUBJECT = "Codigo de verificacion";
const FROM = "nicolasgraullera@gmail.com";

/**
 * Crea un registro de verificación de usuario y envía un código de verificación por correo electrónico.
 *
 * @param {string} email - Dirección de correo electrónico del usuario que se va a verificar.
 * @returns {Promise<void>} - No devuelve ningún valor explícito, pero almacena el código en la base de datos y envía un correo electrónico.
 */
const createUserVerification = async (email) => {
  try {
    const code = generateVerificationCode().toString();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); //15 minutos

    const data = {
      email,
      code,
      codeExpiresAt,
    };

    //Creamos el userVerification en la db
    await userVerificationModel.create(data);

    //Mandamos el email al usuario con el codigo
    const emailOptions = {
      subject: SUBJECT,
      text: code,
      to: data.email,
      from: FROM,
    };
    await send(emailOptions);
    return code; //Para poder hacer tests
  } catch (error) {
    console.error("\nError creando documento userVerification:");
    console.log("-".repeat(50) + "\n", error);
  }
};

module.exports = createUserVerification;
