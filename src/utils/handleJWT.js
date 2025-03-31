const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Genera un token JWT para un usuario con un tiempo de expiración de 24 horas.
 *
 * @param {Object} user - Objeto de usuario que contiene el `_id` y el `role`.
 * @param {string} user._id - Identificador único del usuario.
 * @param {string} user.role - Rol del usuario en la aplicación.
 *
 * @returns {string} - Token JWT firmado.
 */
const tokenSign = (user) => {
  const sign = jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
  return sign;
};

/**
 * Verifica y decodifica un token JWT.
 *
 * @param {string} tokenJwt - Token JWT a verificar.
 *
 * @returns {Object|null} - Devuelve el payload del token si es válido, o `null` si la verificación falla.
 */
const verifyToken = (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { tokenSign, verifyToken };
