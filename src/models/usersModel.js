/*
Esquema de mongo para almacenar los usuarios
Relaciones: 
  - mailValidation: Contiene informacion sobre si el usuario ha validado el mail o no
*/
const mongoose = require("mongoose");
//const mongooseDelete = require("mongoose-delete");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    surname: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    status: {
      type: Boolean,
      default: false,
    },
    role: {
      type: ["user", "admin"],
      default: "user",
    },
    verificated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

//UserSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("users", UserSchema);
