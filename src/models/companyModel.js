const mongoose = require("mongoose");

/**
 * Esquema de Mongoose para el modelo de Company.
 *
 * Campos:
 * 1. `email`: Lista de correos electrónicos asociados a la empresa. Tipo: `Array de String`.
 * 2. `company`: Objeto que contiene la información de la empresa:
 *    - `name`: Nombre de la empresa. Tipo: `String`.
 *    - `cif`: Código de identificación fiscal. Tipo: `String`. Único.
 *    - `street`: Nombre de la calle. Tipo: `String`.
 *    - `number`: Número del domicilio. Tipo: `Number`.
 *    - `postal`: Código postal. Tipo: `Number`.
 *    - `city`: Ciudad donde se encuentra la empresa. Tipo: `String`.
 *    - `province`: Provincia donde se encuentra la empresa. Tipo: `String`.
 */
const CompanySchema = new mongoose.Schema(
  {
    boss: String,
    employees: [String],
    company: {
      name: String,
      cif: {
        type: String,
        unique: true,
      },
      street: String,
      number: Number,
      postal: Number,
      city: String,
      province: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("companies", CompanySchema);
