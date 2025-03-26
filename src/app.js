const express = require("express");
const cors = require("cors"); //Para admitir peticiones de cualquier origen
const env = require("dotenv"); //Para utilizar las variables de entorno

//Obtenemos las variables de entorno
env.config();
const port = process.env.PORT || 3000;

const app = express(); //Instancia de express
app.use(cors());
app.use(express.json()); //Para poder recibir datos en formato JSON
app.use("public", express.static("src/storage")); //"Sirve" los archivos guardados en src/storage en http://localhost:3000/public.

// Manejo de errores JSON mal formateado, ocurren antes del validador
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("\nError de JSON mal formado:");
    console.log("-".repeat(50) + "\n", err);
    return res.status(400).json({ error: "Formato JSON inválido en la petición" });
  }
  next();
});

//Conexion a la base de datos
const dbConnect = require("./config/mongo.js");
dbConnect();

//Router
const router = require("./routes/index.js");
app.use("/api", router);

//Arranque de la app
app.listen(port, () => {
  console.log(`\nServidor corriendo en el puerto --> ${port}`);
  console.log("-".repeat(50));
});
