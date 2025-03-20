const mongoose = require("mongoose");

/**
 * Esquema de Mongoose para el modelo de verificación de usuario.te esquema define la estructura de los documentos en la colección de verificación de usuarios en la base de datos.
 *
 * Campos:
 * 1. `email`: Correo electrónico del usuario. Tipo: `String`. Único
 * 2. `code`: Código de verificación generado para el usuario. Tipo: `String`.
 * 3. `codeExpiresAt`: Fecha de expiración del código de verificación. Tipo: `Date`.
 * 4. `attemps`: Número de intentos fallidos de verificación. Tipo: `Number`. El valor por defecto es `0`.
 * 5. `maxAttemps`: Número máximo de intentos de verificación permitidos. Tipo: `Number`. El valor por defecto es `5`.
 * 6. `blocked`: Estado de bloqueo del usuario. Tipo: `Boolean`. El valor por defecto es `false`.
 * 7. `blockedExpiresAt`: Fecha en la que se desbloqueará al usuario, si está bloqueado. Tipo: `Date`. No tiene valor por defecto.
 */
const UserVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    code: String,
    codeExpiresAt: Date,
    attemps: {
      type: Number,
      default: 0,
    },
    maxAttemps: {
      type: Number,
      default: 5,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    blockedExpiresAt: Date, //Sin valor por defecto
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("userVerification", UserVerificationSchema);
