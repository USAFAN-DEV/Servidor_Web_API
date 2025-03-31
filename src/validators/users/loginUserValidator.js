//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("email")
    .exists()
    .withMessage("Error. El email es obligatorio.")
    .isEmail()
    .withMessage("Error. Introduzca un email válido."),

  check("password")
    .exists()
    .withMessage("Error. La contraseña es obligatoria.")
    .isString()
    .withMessage("Error. La contraseña debe ser un string.")
    .isLength({ min: 8 })
    .withMessage("Error. La contraseña debe tener al menos 8 caracteres."),

  (req, res, next) => validateResults(req, res, next),
];

module.exports = validatorCreateItem;
