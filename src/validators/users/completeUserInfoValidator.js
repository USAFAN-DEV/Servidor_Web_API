//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("name")
    .exists()
    .withMessage("Error. Introduzca tu nombre ('name').")
    .isString()
    .withMessage("Error. El campo 'name' debe ser un string."),

  check("surname")
    .exists()
    .withMessage("Error. Introduzca tus apellidos ('surname').")
    .isString()
    .withMessage("Error. El campo 'surname' debe ser un string."),

  check("nif")
    .exists()
    .withMessage("Error. Introduzca tu NIF.")
    .isString()
    .withMessage("Error. El NIF debe ser un string.")
    .isLength({ min: 8, max: 8 })
    .withMessage("Error. El NIF debe estar compuesto por 8 caracteres."),

  (req, res, next) => validateResults(req, res, next),
];

module.exports = validatorCreateItem;
