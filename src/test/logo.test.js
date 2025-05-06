//Librerias
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");

//Main
const { app, server } = require("../app.js");

//Models
const userModel = require("../models/userModel.js");
const logoModel = require("../models/logoModel.js");

//Config
const api = supertest(app);

//Datos de prueba
let token;
let user;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));
  await userModel.deleteMany({});
  await logoModel.deleteMany({});

  user = await userModel.create({ email: "logouser@gmail.com", password: "12345678" });
  token = jwt.sign({ _id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "24h" });
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.close();
});

describe("Subida de logo", () => {
  test("Subir logo correctamente", async () => {
    const filePath = path.join(__dirname, "assets", "test-image.png");

    const response = await api
      .post("/api/logo")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", filePath)
      .expect(201);

    expect(response.body.message).toBe("Logo creado");
    expect(response.body.result).toHaveProperty("filename");
    expect(response.body.result).toHaveProperty("url");

    const updatedUser = await userModel.findById(user._id);
    expect(updatedUser.logo_id.toString()).toBe(response.body.result._id);
  });

  test("No debe crear logo si no se sube un archivo", async () => {
    const response = await api.post("/api/logo").set("Authorization", `Bearer ${token}`).expect(400); // Esperamos un error 400 si no se sube archivo
    expect(response.body).toHaveProperty("error", "Debes subir un archivo de imagen.");
  });
});
