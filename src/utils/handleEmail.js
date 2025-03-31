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

    const accessTokenObj = await oauth2Client.getAccessToken();
    const accessToken = accessTokenObj?.token;

    if (!accessToken) {
      throw new Error("No se pudo obtener el Access Token.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken: accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    throw new Error("Failed to create email transporter. Detalles: " + error.message);
  }
};

/**
 * Envía un correo electrónico utilizando el transporter configurado con OAuth2.
 *
 * Esta función se encarga de enviar un correo electrónico con el código de verificación u otro contenido especificado.
 *
 * @param {Object} emailOptions - Opciones del correo, incluyendo el destinatario, asunto y contenido.
 * @param {string} emailOptions.to - Dirección de correo del destinatario.
 * @param {string} emailOptions.from - Dirección de correo del remitente.
 * @param {string} emailOptions.subject - Asunto del correo.
 * @param {string} emailOptions.text - Cuerpo del correo en texto plano.
 *
 * @returns {Promise<void>} - No devuelve nada
 */
const send = async (emailOptions) => {
  try {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
  } catch (error) {
    console.error("\nError enviando el correo electronico:");
    console.log("-".repeat(50) + "\n", error);
  }
};

module.exports = send;
