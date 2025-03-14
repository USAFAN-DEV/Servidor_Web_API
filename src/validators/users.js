const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");
const validatorCreateItem = [
  check("email").exists().isEmail(),
  check("password")
    .exists()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  (req, res, next) => validateResults(req, res, next),
];
module.exports = validatorCreateItem;
