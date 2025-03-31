//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("email")
    .exists()
    .withMessage("Error. El email es obligatorio.")
    .isEmail()
    .withMessage("Error. Introduzca un email válido."),

  check("code")
    .exists()
    .withMessage("Error. Introduzca el código de verificación.")
    .isString()
    .withMessage("Error. El código de verificación debe ser un string.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Error. El código debe tener exactamente 6 caracteres."),

  (req, res, next) => validateResults(req, res, next),
];

module.exports = validatorCreateItem;
