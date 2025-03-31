const mongoose = require("mongoose"); //Para trabajar con mongo

/**
 * Establece la conexión a la base de datos usando Mongoose.
 * @returns {Promise<void>} - No devuelve un valor explícito, pero maneja la conexión a la base de datos.
 */
const dbConnect = async () => {
  //Obtenemos la db_uri
  const db_uri = process.env.DB_URI;
  if (!db_uri) {
    console.error("\nError: DB_URI no esta definida. Revisa el .env");
    console.log("-".repeat(50));
    return;
  }

  mongoose.set("strictQuery", false); //Desabilitamos el modo estricto en las consultas

  //Registramos el evento
  mongoose.connection.on("connected", () => {
    console.log("Conexión establecida con la base de datos");
    console.log("-".repeat(50));
  });

  //Conexión a la base de datos
  try {
    await mongoose.connect(db_uri);
  } catch (error) {
    console.error("\nError: No es posible conectarse a la base de datos:\n", error);
    console.log("-".repeat(50));
  }
};

module.exports = dbConnect;
