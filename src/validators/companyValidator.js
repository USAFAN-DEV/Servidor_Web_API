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
    .withMessage("El campo 'email' es obligatorio.")
    .isEmail()
    .withMessage("Por favor, introduzca un email válido."),
  check("company.name").exists().withMessage("El nombre de la empresa es obligatorio."),
  check("company.cif")
    .exists()
    .withMessage("El CIF es obligatorio.")
    .isLength({ min: 8, max: 9 })
    .withMessage("El CIF debe tener entre 8 y 9 caracteres."),
  check("company.street").optional().isString().withMessage("La calle debe ser un string."),
  check("company.number").optional().isNumeric().withMessage("El número debe ser un valor numérico."),
  check("company.postal")
    .optional()
    .isNumeric()
    .withMessage("El código postal debe ser numérico.")
    .isLength({ min: 5, max: 5 })
    .withMessage("El codigo postal debe tener 5 caracteres."),
  check("company.city").optional().isString().withMessage("La ciudad debe ser un string."),
  check("company.province").optional().isString().withMessage("La provincia debe ser un string."),

  (req, res, next) => validateResults(req, res, next),
];
module.exports = validatorCreateItem;
