const UserVerificationModel = require("../models/userVerificationModel.js");
const crypto = require("crypto");

const generateVerificationCode = () => {
  const codigo = crypto.randomInt(100000, 1000000); // Genera un número entre 100000 y 999999
  return codigo;
};

const createUserVerification = async (email) => {
  try {
    const code = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); //15 minutos

    const data = {
      email,
      code,
      codeExpiresAt,
    };

    await UserVerificationModel.create(data);
    return code;
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = { createUserVerification };
