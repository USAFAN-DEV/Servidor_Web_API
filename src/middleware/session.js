const { verifyToken } = require("../utils/handleJWT");
const UserModel = require("../models/userModel.js");

/**
 * Middleware de autenticación para proteger rutas mediante JWT.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para continuar con la siguiente capa de middleware.
 * @returns {void} - Responde con un error si la autenticación falla.
 */
const authMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).send("Error, no cuentas con la autorización requerida.");
    console.error("\nError. Se requiere de un token JWT.");
    console.log("-".repeat(50));
  } else {
    const token = req.headers.authorization.match(/Bearer\s(\S+)/)[1];
    const data = verifyToken(token);
    if (data) {
      const user = await UserModel.findById(data._id);
      req.user = user;
      next();
    } else {
      res.status(401).send("Error, el token JWT es incorrecto.");
      console.error("\nError. El token JTW es incorrecto.");
      console.log("-".repeat(50));
    }
  }
};

module.exports = authMiddleware;
