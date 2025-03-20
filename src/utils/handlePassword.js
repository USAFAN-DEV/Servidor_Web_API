const bcryptjs = require("bcryptjs");

/**
 * Encripta una contraseña en texto plano utilizando bcryptjs.
 *
 * @param {string} clearPassword - La contraseña en texto plano que se desea encriptar.
 * @returns {Promise<string>} - Retorna una promesa que resuelve el hash de la contraseña encriptada.
 */
const encrypt = async (clearPassword) => {
  // "Salt" de 10 rondas, añade aleatoriedad. 2 contraseñas idénticas generan hashes diferentes
  const hash = await bcryptjs.hash(clearPassword, 10);
  return hash;
};

/**
 * Compara una contraseña en texto plano con una versión encriptada (hash) de la contraseña.
 *
 * @param {string} clearPassword - La contraseña en texto plano que se desea comparar.
 * @param {string} hashedPassword - El hash previamente generado y almacenado de la contraseña.
 * @returns {Promise<boolean>} - Retorna una promesa que resuelve `true` si las contraseñas coinciden, o `false` si no lo hacen.
 */
const compare = async (clearPassword, hashedPassword) => {
  // Compara entre la password en texto plano y su hash calculado anteriormente para decidir si coincide.
  const result = await bcryptjs.compare(clearPassword, hashedPassword);
  return result;
};
module.exports = { encrypt, compare };
