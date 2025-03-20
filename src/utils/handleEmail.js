const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

/**
 * Crea un transporter de Nodemailer utilizando OAuth2 con las credenciales de Google.
 *
 * Esta función establece la conexión con el servicio de correo de Gmail utilizando OAuth2 para autenticar las credenciales del usuario.
 *
 * @returns {Promise<Object>} - Un objeto `transporter` configurado para enviar correos electrónicos usando OAuth2.
 */
const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    // Obtener el Access Token de manera correcta
    const accessToken = await oauth2Client.getAccessToken();

    // Crear el transporter con OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken: accessToken.token, // Aquí corregimos el acceso al token
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw new Error("Failed to create email transporter.");
  }
};

/**
 * Envía un correo electrónico utilizando el transporter configurado con OAuth2.
 *
 * Esta función se encarga de enviar el correo con el código de verificación u otro contenido especificado.
 *
 * @param {Object} emailOptions - Las opciones del correo, incluyendo el destinatario, asunto, cuerpo, etc.
 *    - Ejemplo de estructura:
 *      {
 *        subject: "Verificación de correo",
 *        text: "Tu código de verificación es: 123456"
 *        to: "usuario@example.com",
 *        from: "usario2@example.com"
 *      }
 * @returns {Promise<void>} - No devuelve nada, solo maneja el envío del correo.
 */
const send = async (emailOptions) => {
  try {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);

    console.log("Correo con el codigo de verificacion enviado a:", emailOptions.to);
  } catch (error) {
    console.log("Error:", error);
  }
};

module.exports = send;
