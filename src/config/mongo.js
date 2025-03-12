const mongoose = require("mongoose"); //Para trabajar con mongo

const dbConnect = () => {
  //Obtenemos la db_uri
  const db_uri = process.env.DB_URI;
  if (!db_uri) {
    console.error("Error: DB_URI no esta definida. Revisa el .env");
    return;
  }

  mongoose.set("strictQuery", false); //Desabilitamos el modo estricto en las consultas

  //Conexión a la base de datos
  try {
    mongoose.connect(db_uri);
  } catch (error) {
    console.error(
      "Error: No es posible conectarse a la base de datos:\n",
      error
    );
  }

  //Prueba
  mongoose.connection.on("connected", () => {
    console.log("Conectado a la base de datos\n");
  });
};

module.exports = dbConnect;
