const { matchedData } = require("express-validator");
const CompanyModel = require("../models/companyModel.js");

/**
 * Registra un usuario en una empresa en la base de datos. Si la empresa no está creada, la crea y añade el usuario.
 * Si está creada, simplemente lo añade
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} req.body - Datos enviados en la solicitud.
 *
 * @param {string} req.body.email - Email del usuario.
 * @param {string} req.body.company - Objeto con la información de la empresa. (/models/companyModel.js para mas info)
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} - Devuelve una mensaje de éxito, una respuesta HTTP con la empresa creada o un error.
 */

//TODO En el result no se pueden ver todos los correos asociados a la empresa.

const createCompany = async (req, res) => {
  try {
    const body = matchedData(req);
    const company = await CompanyModel.findOne({ "company.cif": body.company.cif });

    //Si ya esta la empresa registrada
    if (company) {
      if (company.email.includes(body.email)) {
        console.error(
          `\nError en PATCH /api/company. El usuario ${body.email} ya esta registrado en la empresa ${company.name}.`
        );
        console.log("-".repeat(50));
        return res.status(409).send("El usuario ya esta registrado en esta empresa");
      }

      company.email.push(body.email);
      await company.save();

      console.log(`\nLa empresa ${company.name} ya estaba creada.`);
      console.log("-".repeat(50));
      console.log(`\nUsuario ${company.email} añadido a la empresa.`);
      console.log("-".repeat(50));
      return res.status(204).send("Usuario añadido a la empresa");
    } else {
      const result = await CompanyModel.create(body);

      console.log(`\nLa empresa ${company.name} ha sido creada.`);
      console.log("-".repeat(50));
      console.log(`\nUsuario ${company.email} añadido a la empresa.`);
      console.log("-".repeat(50));
      return res.status(201).json({ message: "Empresa creada y usuario registrado en esta.", result: result });
    }
  } catch (error) {
    if (error.code === 11000) {
      //Email repetido
      console.error("\nError en PATCH /api/company. CIF repetido:");
      console.log("-".repeat(50) + "\n", error);
      res.status(409).send("CIF repetido. Por favor, revisa los datos introducidos.");
    } else {
      console.error("\nError en PATCH /api/company. Error del servidor:");
      console.log("-".repeat(50) + "\n", error);
      res.status(500).send("Error del servidor al registrar el usuario");
    }
  }
};

module.exports = createCompany;
