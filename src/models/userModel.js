const mongoose = require("mongoose");
//const mongooseDelete = require("mongoose-delete");

/**
 * Esquema de Mongoose para el modelo de usuario.
 *
 * Campos:
 * 1. `name`: Nombre del usuario. Tipo: `String`.
 * 2. `surname`: Apellido del usuario. Tipo: `String`.
 * 3. `email`: Correo electrónico del usuario. Tipo: `String`. Único
 * 4. `password`: Contraseña del usuario. Tipo: `String`.
 * 5. `role`: Rol del usuario. Tipo: `String`, con dos posibles valores: `user` o `admin`. Por defecto es `user`
 * 6. `verificated`: Indicador de si el usuario ha verificado su correo electrónico. Tipo: `Boolean`. Por defecto es `false`.
 */
const UserSchema = new mongoose.Schema(
  {
    name: String,
    surname: String,
    nif: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    role: {
      type: ["user", "admin"],
      default: "user",
    },
    verificated: {
      type: Boolean,
      default: false,
    },
    logo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "logos",
    },
  },
  { timestamps: true, versionKey: false }
);

//UserSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("users", UserSchema);
