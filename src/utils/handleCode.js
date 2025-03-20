const crypto = require("crypto");

/**
 * Genera un código de verificación aleatorio de 6 dígitos.
 *
 * @returns {number} - Un número aleatorio de 6 dígitos, entre 100000 y 999999.
 *
 */
const generateVerificationCode = () => {
  const codigo = crypto.randomInt(100000, 1000000); // Genera un número entre 100000 y 999999
  return codigo;
};

module.exports = generateVerificationCode;
