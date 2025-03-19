/*
Esquema de mongo que almacena la informacion necesaria del estado de un correo electronico
Relaciones:
    - usersModel: Contiene informacion sobre el usuario que utiliza el mail
*/

const mongoose = require("mongoose");

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
