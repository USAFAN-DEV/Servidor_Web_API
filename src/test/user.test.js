//Librerias
const supertest = require("supertest");
const mongoose = require("mongoose"); //Para trabajar con mongo

//Main
const { app, server } = require("../app.js");

//Modelos
const userModel = require("../models/userModel.js");
const userVerificationModel = require("../models/verificationModel.js");

//Config
const api = supertest(app);

//Datos de prueba
const email = "bydartex@gmail.com";
const password = "123456789";
const fakeUser = {
  email: "123@gmail.com",
  code: "123456",
};

//Variables
let token;
let emailCode;
let user_id;

// Setup y Teardown
beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));

  await userModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

//Test: Registro de usuario
describe("Registro de usuario", () => {
  //Datos para el test
  const errorValidationUser = {
    email: "123gmail.com",
    password: "123",
  };

  test("No registrar un nuevo usuario con campos incorrectos", async () => {
    const response = await api.post("/api/user/register").send(errorValidationUser).expect(403);
    expect(response.body.errors).toBeDefined();
  });

  test("Registrar un nuevo usuario", async () => {
    const response = await api.post("/api/user/register").send({ email, password }).expect(201);
    expect(response.body.message).toBe("Usuario creado");
    token = response.body.result.token;
    emailCode = response.body.result.code;
    user_id = response.body.result.result._id;

    console.log(response.body);

    //Comprobamos que el usuario se creo
    const user = await userModel.findOne({ email });
    expect(user).toBeDefined();

    //Comprobamos que el modelo de verificacion de usuario se creo
    const userVerification = await userVerificationModel.findOne({ email });
    expect(userVerification).toBeDefined();
  });

  test("No registrar un nuevo usuario con un correo ya utilizado", async () => {
    const response = await api.post("/api/user/register").send({ email, password }).expect(409);
    console.log(response.body);

    expect(response.text).toBe("Error. Email repetido. Por favor, utiliza otro email para el registro");
  });
});

//Test: Verificacion de usuario
describe("Verificacion de usuario", () => {
  //Datos para el test
  const errorValidationUserVerification = {
    email: "123gmail.com",
    code: "123",
  };

  test("No verificar un usuario con un JWT incorrecto", async () => {
    const response = await api
      .post("/api/verification")
      .set("Authorization", `Bearer ${"1234566784098836"}`)
      .send({ email, code: emailCode })
      .expect(401);

    expect(response.text).toBe("Error, el token JWT es incorrecto.");
  });

  test("No verificar un usuario con campos incorrectos", async () => {
    const response = await api.post("/api/verification").send(errorValidationUserVerification).expect(403);
    expect(response.body.errors).toBeDefined();
  });

  test("No verificar un usuario que no existe", async () => {
    const response = await api
      .post("/api/verification")
      .set("Authorization", `Bearer ${token}`)
      .send(fakeUser)
      .expect(404);

    expect(response.text).toBe("Error. El usuario no existe.");
  });

  test("No verificar un usuario con un codigo incorrecto", async () => {
    const response = await api
      .post("/api/verification")
      .set("Authorization", `Bearer ${token}`)
      .send({ email, code: "errors" })
      .expect(400);

    expect(response.text).toBe("Código incorrecto, intente nuevamente.");
  });

  test("Verificar un usuario", async () => {
    const response = await api
      .post("/api/verification")
      .set("Authorization", `Bearer ${token}`)
      .send({ email, code: emailCode })
      .expect(200);

    expect(response.text).toBe("Usuario verificado.");

    // Verificar que el usuario haya sido marcado como verificado
    const user = await userModel.findOne({ email });
    expect(user.verificated).toBe(true);

    // Verificar que el documento de verificación ya no exista
    const userVerification = await userVerificationModel.findOne({ email });
    expect(userVerification).toBeNull(); // Asegúrate de que el documento sea null
  });
});

describe("Obtener usuario", () => {
  test("No devolver el usuario con JWT incorrecto", async () => {
    const response = await api.get("/api/user/me").set("Authorization", `Bearer ${"123145374"}`).expect(401);
    expect(response.text).toBe("Error, el token JWT es incorrecto.");
  });

  test("Devolver el usuario", async () => {
    const response = await api.get("/api/user/me").set("Authorization", `Bearer ${token}`).expect(200);
    expect(response.body.message).toBe("Usuario encontrado.");
    expect(response.body.result.email).toBe(email);
  });
});

describe("Completar usuario", () => {
  const completeUserInfo = {
    name: "Nicolas",
    surname: "Graullera",
    nif: "1234567Z",
  };

  const errorValidationCompleteInfoUser = {
    name: "Nicolas",
    nif: 123,
  };

  test("No completar un usuario con un JWT incorrecto", async () => {
    const response = await api
      .patch("/api/user/complete-info")
      .set("Authorization", `Bearer 1234566784098836`)
      .send(completeUserInfo)
      .expect(401);

    expect(response.text).toBe("Error, el token JWT es incorrecto.");
  });

  test("No completar un usuario con campos incorrectos", async () => {
    const response = await api
      .patch("/api/user/complete-info")
      .set("Authorization", `Bearer ${token}`)
      .send(errorValidationCompleteInfoUser)
      .expect(403);
    expect(response.body.errors).toBeDefined();
  });

  test("Completar la información de un usuario existente", async () => {
    const response = await api
      .patch("/api/user/complete-info")
      .set("Authorization", `Bearer ${token}`)
      .send(completeUserInfo)
      .expect(200);
    expect(response.body.message).toBe("Información actualizada");

    // Comprobar que los datos del usuario han sido actualizados
    const user = await userModel.findById(user_id);
    expect(user.name).toBe(completeUserInfo.name);
    expect(user.surname).toBe(completeUserInfo.surname);
    expect(user.nif).toBe(completeUserInfo.nif);
  });
});

describe("Login de usuario", () => {
  const loginUrl = "/api/user/login";

  const invalidPassword = {
    email: "bydartex@gmail.com",
    password: "wrongpassword",
  };

  const unverifiedUser = {
    email: "noverificado@gmail.com",
    password: "123456789",
  };

  const unregisteredEmail = {
    email: "nonexistent@example.com",
    password: "123456789",
  };

  beforeAll(async () => {
    // Crear un usuario no verificado
    const unverified = new userModel({
      email: unverifiedUser.email,
      password: await require("../utils/handlePassword").encrypt(unverifiedUser.password),
      verificated: false,
    });
    await unverified.save();
  });

  test("No iniciar sesión con un email no registrado", async () => {
    const response = await api.post(loginUrl).send(unregisteredEmail).expect(404);
    expect(response.text).toBe("Error. El usuario no existe");
  });

  test("No iniciar sesión si el usuario no está verificado", async () => {
    const response = await api.post(loginUrl).send(unverifiedUser).expect(401);
    expect(response.text).toBe("Error. El usuario no ha sido verificado. Por favor verifica el correo electronico");
  });

  test("No iniciar sesión con contraseña incorrecta", async () => {
    const response = await api.post(loginUrl).send(invalidPassword).expect(403);
    expect(response.text).toBe("Error. La contraseña introducida es incorrecta");
  });

  test("Iniciar sesión correctamente", async () => {
    const response = await api.post(loginUrl).send({ email, password }).expect(200);

    expect(response.body.message).toMatch(/Inicio de sesión completado/);
    expect(response.body.token).toBeDefined();
    expect(response.body.result.email).toBe(email);
  });
});
