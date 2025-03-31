const { matchedData } = require("express-validator");
const CompanyModel = require("../models/companyModel.js");
const UserModel = require("../models/userModel.js");

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

const createCompany = async (req, res) => {
  try {
    const body = matchedData(req);
    const user = await UserModel.findOne({ email: body.boss });
    if (!user) {
      console.error("\nError en PUT /api/company. El jefe no existe.");
      console.log("-".repeat(50));
      return res.status(404).json({ message: "El jefe no existe. Por favor, revisa los datos introducidos." });
    }
    const result = await CompanyModel.create(body);

    console.log(`\nLa empresa ${result.company.name} ha sido creada.`);
    console.log("-".repeat(50));

    return res.status(201).json({ message: "Empresa creada", result: result });
  } catch (error) {
    if (error.code === 11000) {
      //Email repetido
      console.error("\nError en PATCH /api/company. CIF repetido:");
      console.log("-".repeat(50) + "\n", error);
      res.status(409).send("CIF repetido. Por favor, revisa los datos introducidos.");
    } else {
      console.error("\nError en PATCH /api/company. Error del servidor:");
      console.log("-".repeat(50) + "\n", error);
      res.status(500).send("Error del servidor al crear la empresa");
    }
  }
};

/**
 * Añade empleados a una empresa existente en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} req.body - Datos enviados en la solicitud.
 * @param {string} req.body.cif - CIF de la empresa a la que se añadirá el usuario.
 * @param {Array<string>} req.body.employees - Lista de emails de los empleados a añadir.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} - Devuelve un mensaje de éxito si los empleados se añaden correctamente,
 * un mensaje de error si la empresa no existe o si hay un problema con la base de datos.
 *
 * @throws {Error} - Captura y maneja errores en la base de datos o en la lógica de validación.
 *
 * @todo Validar que los empleados existen antes de añadirlos a la empresa.
 * @todo Evitar agregar empleados duplicados sin necesidad de recorrer la lista manualmente.
 * @todo Mejorar la respuesta del servidor con una lista de empleados añadidos y los que ya estaban.
 */
const addUserToCompany = async (req, res) => {
  try {
    const id = req.user._id;
    const { cif, employees } = matchedData(req);

    // Buscar la empresa por CIF
    const company = await CompanyModel.findOne({ "company.cif": cif });
    if (!company) {
      console.error("\nError en PATCH /api/company. La empresa no existe.");
      console.log("-".repeat(50));
      return res.status(404).json({ message: "La empresa no existe. Por favor, revisa los datos introducidos." });
    }

    const user = await UserModel.findById(id);
    if (user.email !== company.boss) {
      console.error("\nError en PATCH /api/company. Solo el jefe puede añadir empleados.");
      console.log("-".repeat(50));
      return res.status(403).json({ message: "Solo el jefe puede añadir empleados." });
    }

    // Validar que los empleados existen en la base de datos
    const existingUsers = await UserModel.find({ email: { $in: employees } }, "email");
    const existingEmails = existingUsers.map((user) => user.email);
    const invalidEmails = employees.filter((email) => !existingEmails.includes(email));

    if (invalidEmails.length > 0) {
      console.error("\nError en PATCH /api/company. Algunos usuarios no existen:", invalidEmails);
      return res.status(404).json({ message: "Algunos usuarios no existen en la base de datos.", invalidEmails });
    }

    // Filtrar empleados ya registrados para evitar duplicados
    const nuevosEmpleados = existingEmails.filter((emp) => !company.employees.includes(emp));

    if (nuevosEmpleados.length === 0) {
      return res.status(200).json({ message: "Todos los empleados ya estaban registrados en la empresa." });
    }

    // Agregar nuevos empleados a la empresa
    company.employees.push(...nuevosEmpleados);
    await company.save();

    console.log(`\nUsuarios añadidos a la empresa ${company.company.name}:`, nuevosEmpleados);
    console.log("-".repeat(50));

    return res.status(200).json({
      message: "Empleados añadidos exitosamente.",
      added: nuevosEmpleados,
    });
  } catch (error) {
    console.error("\nError en PATCH /api/company. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).json({ message: "Error del servidor al añadir empleados" });
  }
};

/**
 * Obtiene la información de un usuario existente en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 *
 * @param {Object} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<void>} - Devuelve un mensaje de éxito o un error.
 *
 */

const getCompany = async (req, res) => {
  try {
    const { cif } = req.query; // Obtener 'cif' desde query params
    if (!cif) {
      return res.status(400).json({ message: "Error. Introduzca el CIF de la empresa." });
    }

    const id = req.user._id;
    const user = await UserModel.findById(id);
    const company = await CompanyModel.findOne({ "company.cif": cif });

    if (!company) {
      console.error("\nError en GET /api/company. La empresa no existe.");
      console.log("-".repeat(50));
      return res.status(404).send("La empresa no existe en la base de datos.");
    }

    if (!user) {
      console.error("\nError en GET /api/company. El usuario no existe.");
      console.log("-".repeat(50));
      return res.status(404).send("El usuario no existe en la base de datos.");
    }

    if (user.email !== company.boss) {
      console.error("\nError en GET /api/company. Solo el jefe puede ver la empresa.");
      console.log("-".repeat(50));
      return res.status(403).send("Solo el jefe puede ver la empresa.");
    }

    console.log(`\nEmpresa encontrada.`);
    console.log("-".repeat(50));
    res.status(200).json({ message: "Empresa encontrada", result: company });
  } catch (error) {
    console.error("\nError en GET /api/user. Error del servidor:");
    console.log("-".repeat(50) + "\n", error);
    res.status(500).send("Error del servidor al intentar encontrar el usuario");
  }
};

module.exports = { createCompany, addUserToCompany, getCompany };
