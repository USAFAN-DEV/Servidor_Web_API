//Librerias
const supertest = require("supertest");
const mongoose = require("mongoose"); //Para trabajar con mongo
const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();

//Main
const { app, server } = require("../app.js");

//Modelos
const userModel = require("../models/userModel.js");
const companyModel = require("../models/companyModel.js");

//Config
const api = supertest(app);

//Datos de prueba
const validCompany = {
  boss: "companyUser@gmail.com", // Este email debe ser de un usuario ya creado
  company: {
    name: "Tech S.A.",
    cif: "A12345678",
    street: "Calle Falsa",
    number: 123,
    postal: "28080",
    city: "Madrid",
    province: "Madrid",
  },
};

const invalidCompany = {
  boss: "noexiste@email.com", // No existe en la DB
  company: {
    name: "FakeCorp",
    cif: "Z00000000",
    street: "Ninguna",
    number: 0,
    postal: "12345",
    city: "Nowhere",
    province: "Nada",
  },
};

const employeeEmails = ["employee1@example.com", "employee2@example.com"];
const invalidEmployeeEmails = ["employee3@example.com", "employee4@example.com"];

//Variables
let token;
let employeeTokens = [];

// Setup y Teardown
beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));
  await userModel.deleteMany({});
  await companyModel.deleteMany({});

  // Crea un nuevo usuario de prueba
  const newUser = new userModel({
    name: "Test Boss",
    email: "companyUser@gmail.com",
    password: "123456789", // hash de "123456"
    verificated: true,
  });

  const savedUser = await userModel.create(newUser);
  token = jwt.sign(
    {
      _id: savedUser._id,
      role: savedUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  // Crear empleados
  for (const email of employeeEmails) {
    const employee = new userModel({
      name: `Test Employee ${email}`,
      email: email,
      password: "123456789",
      verificated: true,
    });
    const savedEmployee = await userModel.create(employee);

    const employeeToken = jwt.sign({ _id: savedEmployee._id, role: savedEmployee.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    employeeTokens.push(employeeToken); // Guardamos los tokens para futuros tests
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe("Crear empresa", () => {
  test("No crear empresa sin token", async () => {
    const response = await api
      .put("/api/company/create-company")
      .set("Authorization", `Bearer ${"1234566784098836"}`)
      .send(validCompany)
      .expect(401);

    expect(response.text).toBe("Error, el token JWT es incorrecto.");
  });

  test("No crear empresa si el jefe no existe", async () => {
    const response = await api
      .put("/api/company/create-company")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidCompany)
      .expect(404);

    expect(response.body.message).toBe("El jefe no existe. Por favor, revisa los datos introducidos.");
  });

  test("Crear empresa correctamente", async () => {
    const response = await api
      .put("/api/company/create-company")
      .set("Authorization", `Bearer ${token}`)
      .send(validCompany)
      .expect(201);

    expect(response.body.message).toBe("Empresa creada");
    expect(response.body.result.company.cif).toBe(validCompany.company.cif);
  });

  test("No crear empresa con CIF duplicado", async () => {
    const response = await api
      .put("/api/company/create-company")
      .set("Authorization", `Bearer ${token}`)
      .send(validCompany)
      .expect(409);
    expect(response.text).toBe("CIF repetido. Por favor, revisa los datos introducidos.");
  });
});

describe("Añadir empleados a una empresa", () => {
  test("No añadir empleados sin token", async () => {
    const response = await api
      .patch("/api/company/add-user-company")
      .set("Authorization", "Bearer invalid_token")
      .send({
        cif: validCompany.company.cif,
        employees: employeeEmails,
      })
      .expect(401);
    expect(response.text).toBe("Error, el token JWT es incorrecto.");
  });

  test("No añadir empleados si no es el jefe", async () => {
    const response = await api
      .patch("/api/company/add-user-company")
      .set("Authorization", `Bearer ${employeeTokens[0]}`)
      .send({
        cif: validCompany.company.cif,
        employees: [employeeEmails[1]],
      })
      .expect(403); // Esperamos que devuelva 403

    expect(response.body.message).toBe("Solo el jefe puede añadir empleados.");
  });

  test("Añadir empleados correctamente", async () => {
    const response = await api
      .patch("/api/company/add-user-company")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cif: validCompany.company.cif,
        employees: employeeEmails,
      })
      .expect(200);

    expect(response.body.message).toBe("Empleados añadidos exitosamente.");
    expect(response.body.added).toEqual(employeeEmails);
  });

  test("No añadir empleados si algunos no existen", async () => {
    const response = await api
      .patch("/api/company/add-user-company")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cif: validCompany.company.cif,
        employees: [...employeeEmails, ...invalidEmployeeEmails],
      })
      .expect(404);

    expect(response.body.message).toBe("Algunos usuarios no existen en la base de datos.");
    expect(response.body.invalidEmails).toEqual(invalidEmployeeEmails);
  });

  test("No añadir empleados si todos ya están registrados", async () => {
    const response = await api
      .patch("/api/company/add-user-company")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cif: validCompany.company.cif,
        employees: employeeEmails,
      })
      .expect(200);

    expect(response.body.message).toBe("Todos los empleados ya estaban registrados en la empresa.");
  });

  test("No añadir empleados si la empresa no existe", async () => {
    const response = await api
      .patch("/api/company/add-user-company")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cif: "INVALIDCF",
        employees: employeeEmails,
      })
      .expect(404);

    console.log(response.text);
    expect(response.body.message).toBe("La empresa no existe. Por favor, revisa los datos introducidos.");
  });
});

describe("Obtener información de la empresa", () => {
  test("No obtener información sin CIF", async () => {
    const response = await api.get("/api/company/my-company").set("Authorization", `Bearer ${token}`).expect(400);
    expect(response.text).toBe("Error. Introduzca el CIF de la empresa.");
  });

  test("No obtener información si el usuario no es el jefe", async () => {
    const response = await api
      .get("/api/company/my-company")
      .set("Authorization", `Bearer ${employeeTokens[0]}`) // Token de un empleado
      .query({ cif: validCompany.company.cif })
      .expect(403);

    expect(response.text).toBe("Solo el jefe puede ver la empresa.");
  });

  test("No obtener información si la empresa no existe", async () => {
    const response = await api
      .get("/api/company/my-company")
      .set("Authorization", `Bearer ${token}`)
      .query({ cif: "INVALIDCF" }) // CIF que no existe
      .expect(404);

    console.log(response.body);
    expect(response.text).toBe("La empresa no existe en la base de datos.");
  });

  test("Obtener la información de la empresa correctamente", async () => {
    const response = await api
      .get("/api/company/my-company")
      .set("Authorization", `Bearer ${token}`) // Token del jefe
      .query({ cif: validCompany.company.cif })
      .expect(200);

    expect(response.body.message).toBe("Empresa encontrada");
    expect(response.body.result).toHaveProperty("company");
    expect(response.body.result.company.cif).toBe(validCompany.company.cif); // Verificamos que el CIF es correcto
  });
});
