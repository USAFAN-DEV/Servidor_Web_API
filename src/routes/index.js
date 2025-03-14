const express = require("express");
const fs = require("fs"); //Funciones para trabajar con el sistema de archivos
const router = express.Router();
const removeExtension = (fileName) => {
  //Solo la primera parte del split (lo de antes del punto)
  return fileName.split(".").shift(); //Parecido a fileName.split(".")[0], además modifica el array generado por split (elimina el elemento)
};

fs.readdirSync(__dirname).filter((file) => {
  //Leemos los nombres de los archivos de __dirname
  const name = removeExtension(file);
  if (name !== "index") {
    router.use("/" + name, require("./" + name)); //Enrutador dinámico
  }
});

module.exports = router;
