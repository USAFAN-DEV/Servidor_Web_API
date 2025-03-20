// Modelos
const userModel = require("../models/usersModel.js");
const userVerificationModel = require("../models/userVerificationModel.js");
// Utils
const generateVerificationCode = require("../utils/handleCode.js");
const createUserVerification = require("../utils/handleVerification.js");
const send = require("../utils/handleEmail.js");
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
    await userVerificationModel.updateOne({ email }, { $set: { blocked, blockedExpiresAt } });
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
  const verificationEntry = await userVerificationModel.findOne({ email });
  let maxAttemps = verificationEntry.maxAttemps !== 1 ? verificationEntry.maxAttemps - 1 : 1;

  try {
    // Actualizamos los valores en el modelo de verificación: bloqueado a false, intentos a 0, y maxAttemps ajustado
    await userVerificationModel.updateOne(
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
    await userVerificationModel.updateOne({ email }, { $set: { code, codeExpiresAt }, $inc: { attemps: 1 } });
    const emailOptions = {
      subject: SUBJECT,
      text: code,
      to: email,
      from: FROM,
    };
    await send(emailOptions);

    console.log("Codigo a enviar por correo: ", code);
  } catch (error) {
    // Si hay un error al actualizar el código, lo mostramos
    console.error("Error al actualizar el código de verificación:", error);
    throw new Error("Error al actualizar el código de verificación.");
  }
};

/**
 * Función principal que maneja la verificación del usuario.
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
 * @throws {Error} Si ocurre un error durante el proceso de verificación del usuario.
 */
const verifyUser = async (req, res) => {
  const email = req.body.email; // Obtenemos el correo y el código desde la solicitud
  const code = req.body.code.toString();

  try {
    // Buscamos la entrada de verificación del usuario en la base de datos
    const verificationEntry = await userVerificationModel.findOne({ email });

    // Si no existe la entrada de verificación, significa que el usuario nunca intentó verificar
    if (!verificationEntry) {
      const userEntry = await userModel.findOne({ email });

      // Si el usuario ya está verificado, respondemos con un conflicto
      if (userEntry.verificated) {
        return res.status(409).json({ message: "El usuario ya ha sido verificado." });
      } else {
        // Si el usuario no está verificado, generamos una entrada de verificación
        await createUserVerification(email);
        return res.status(200).json({
          message:
            "Error en el servidor. No se había creado un userVerificationModel. Código enviado al correo. Intente verificar el usuario ahora.",
        });
      }
    }

    // Si ha superado los intentos máximos, bloqueamos el usuario
    if (verificationEntry.attemps >= verificationEntry.maxAttemps) {
      await blockUser(email);
      return res.status(423).json({ message: "Número de intentos máximo alcanzado. El usuario queda bloqueado." });
    }

    // Usuario bloqueado
    if (verificationEntry.blocked) {
      if (verificationEntry.blockedExpiresAt < new Date()) {
        // Si el tiempo de bloqueo ha expirado, eliminamos el bloqueo y reiniciamos los intentos
        await blockTimeExpired(email);
        return res.status(200).json({ message: "Bloqueo de usuario eliminado. Vuelve a intentar la verificación." });
      } else {
        return res.status(423).json({ message: "Usuario bloqueado." });
      }
    }

    // Código expirado
    if (verificationEntry.codeExpiresAt < new Date()) {
      // Si el código ha expirado, generamos uno nuevo y actualizamos la base de datos
      await codeExpired(email);
      return res.status(410).json({ message: "Código expirado. Se ha enviado un nuevo código, vuelva a intentarlo." });
    }

    // Código incorrecto
    if (verificationEntry.code !== code) {
      // Si el código no coincide, incrementamos el número de intentos
      await userVerificationModel.updateOne({ email }, { $inc: { attemps: 1 } });
      return res.status(400).json({ message: "Código de verificación incorrecto, vuelva a intentarlo." });
    }

    // Código correcto, usuario verificado
    await userModel.updateOne({ email }, { $set: { verificated: true } });
    await userVerificationModel.deleteOne({ email });
    return res.status(200).json({ message: "Usuario verificado." });
  } catch (error) {
    // Si ocurre un error, lo capturamos y respondemos con un mensaje de error
    console.error("Error del servidor al verificar al usuario:", error);
    return res.status(500).json({ message: "Error del servidor." });
  }
};

module.exports = verifyUser;
