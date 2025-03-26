const { validationResult } = require("express-validator");

/**
 * Middleware para validar los resultados de las validaciones de los parámetros de la solicitud.
 *
 * @param {Object} req - El objeto de solicitud de Express, que contiene los parámetros, cuerpo, etc.
 * @param {Object} res - El objeto de respuesta de Express, que se utiliza para enviar la respuesta.
 * @param {function} next - La función que se llama para pasar al siguiente middleware o controlador si la validación es exitosa.
 * @returns {void}
 */
const validateResults = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (err) {
    console.error("\nError validando los datos:");
    console.log("-".repeat(50) + "\n", err);
    res.status(403).send({ errors: err });
  }
};

module.exports = validateResults;
