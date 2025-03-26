//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("email").exists().isEmail().withMessage("Por favor, introduzca un email valido."),
  check("name").exists().withMessage("Por favor, introduzca tu nombre ('name')."),
  check("surname").exists().withMessage("Por favor, introduzca tus apellidos ('surname')."),
  check("nif").exists().isLength({ min: 8, max: 8 }).withMessage("El NIF debe estar compuesto por 8 carácteres."),
  (req, res, next) => validateResults(req, res, next),
];
module.exports = validatorCreateItem;
