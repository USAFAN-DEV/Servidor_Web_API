const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const createClientValidator = [
  check("name").optional().isString().withMessage("Error. El nombre debe ser un string."),

  check("cif")
    .exists()
    .withMessage("Error. El cif es obligatorio")
    .isString()
    .withMessage("Error. El CIF debe ser un string.")
    .isLength({ min: 9, max: 9 })
    .withMessage("Error. El CIF debe tener 9 caracteres."),

  check("address").optional(),

  check("address.street").optional().isString().withMessage("Error. La calle debe ser un string."),

  check("address.number").optional().isInt().withMessage("Error. El número debe ser un valor numérico entero."),

  check("address.postal")
    .optional()
    .isString()
    .withMessage("Error. El código postal debe ser un string.")
    .isLength({ min: 5, max: 5 })
    .withMessage("Error. El código postal debe tener 5 caracteres."),

  check("address.city").optional().isString().withMessage("Error. La ciudad debe ser un string."),

  check("address.province").optional().isString().withMessage("Error. La provincia debe ser un string."),
  (req, res, next) => validateResults(req, res, next),
];

const updateClientValidator = [
  check("name").exists().isString().withMessage("Error. El nombre debe ser un string."),

  check("cif")
    .exists()
    .withMessage("Error. El cif es obligatorio")
    .isString()
    .withMessage("Error. El CIF debe ser un string.")
    .isLength({ min: 9, max: 9 })
    .withMessage("Error. El CIF debe tener 9 caracteres."),

  check("address").exists().withMessage("Error, La dirección es obligatoria"),

  check("address.street")
    .exists()
    .withMessage("Error, la calle es obligatoria")
    .isString()
    .withMessage("Error. La calle debe ser un string."),

  check("address.number")
    .exists()
    .withMessage("Error, el numero de calle es obligatorio")
    .isInt()
    .withMessage("Error. El número debe ser un valor numérico entero."),

  check("address.postal")
    .exists()
    .withMessage("Error, el código postal es obligatorio")
    .isString()
    .withMessage("Error. El código postal debe ser un string.")
    .isLength({ min: 5, max: 5 })
    .withMessage("Error. El código postal debe tener 5 caracteres."),

  check("address.city")
    .exists()
    .withMessage("Error, la ciudad es obligatoria")
    .isString()
    .withMessage("Error. La ciudad debe ser un string."),

  check("address.province")
    .exists()
    .withMessage("Error, la provincia es obligatoria")
    .isString()
    .withMessage("Error. La provincia debe ser un string."),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = { createClientValidator, updateClientValidator };
