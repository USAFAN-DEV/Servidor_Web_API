//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../../utils/handleValidator");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("employees").exists().isArray().withMessage("Error. 'employees' debe ser un array."),

  check("cif")
    .exists()
    .withMessage("Error. Introduzca el CIF de la empresa ('company.cif').")
    .isString()
    .withMessage("Error. El CIF debe ser un string.")
    .isLength({ min: 8, max: 9 })
    .withMessage("Error. El CIF debe tener entre 8 y 9 caracteres."),

  (req, res, next) => validateResults(req, res, next),
];

module.exports = validatorCreateItem;
