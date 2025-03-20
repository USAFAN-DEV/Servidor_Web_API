//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("email").exists().isEmail(),
  check("code").exists().isLength({ min: 6, max: 6 }).withMessage("El código debe tener exactamente 6 caracteres"),
  (req, res, next) => validateResults(req, res, next),
];
module.exports = validatorCreateItem;
