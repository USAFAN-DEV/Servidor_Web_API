//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("email").exists().isEmail(),
  check("password").exists().isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
  (req, res, next) => validateResults(req, res, next),
];
module.exports = validatorCreateItem;
