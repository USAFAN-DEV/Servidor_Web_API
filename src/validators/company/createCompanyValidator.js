//Express
const { check } = require("express-validator");
//Utils
const validateResults = require("../../utils/handleValidator.js");

/**
 * @type {Array} validatorCreateItem - Un arreglo de validaciones y un middleware para verificar los datos de la solicitud.
 */
const validatorCreateItem = [
  check("boss")
    .exists()
    .withMessage("Error. Introduzca el email del jefe.")
    .isEmail()
    .withMessage("Error. Introduzca un email válido."),

  check("employees").optional().isArray().withMessage("Error. 'employees' debe ser un array."),

  check("company.name")
    .exists()
    .withMessage("Error. Introduzca el nombre de la empresa ('company.name').")
    .isString()
    .withMessage("Error. El nombre de la empresa debe ser un string."),

  check("company.cif")
    .exists()
    .withMessage("Error. Introduzca el CIF de la empresa ('company.cif').")
    .isString()
    .withMessage("Error. El CIF debe ser un string.")
    .isLength({ min: 8, max: 9 })
    .withMessage("Error. El CIF debe tener entre 8 y 9 caracteres."),

  check("company.street").optional().isString().withMessage("Error. La calle debe ser un string."),

  check("company.number").optional().isInt().withMessage("Error. El número debe ser un valor numérico entero."),

  check("company.postal")
    .optional()
    .isString()
    .withMessage("Error. El código postal debe ser un string.")
    .isLength({ min: 5, max: 5 })
    .withMessage("Error. El código postal debe tener 5 caracteres."),

  check("company.city").optional().isString().withMessage("Error. La ciudad debe ser un string."),

  check("company.province").optional().isString().withMessage("Error. La provincia debe ser un string."),

  (req, res, next) => validateResults(req, res, next),
];

module.exports = validatorCreateItem;
