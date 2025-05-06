const supertest = require("supertest");
const mongoose = require("mongoose"); // Para trabajar con mongo
const jwt = require("jsonwebtoken");

// Main
const { app, server } = require("../app.js");

// Modelos
const deliveryNoteModel = require("../models/deliveryNoteModel.js");
const userModel = require("../models/userModel.js");
const clientModel = require("../models/clientModel.js");
const projectModel = require("../models/projectModel.js");

// Config
const api = supertest(app);

// Datos de prueba
let token;
let user_id;
let client_id;
let project_id;
let albaran_id;
let albaranData;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));

  await userModel.deleteMany({});
  await clientModel.deleteMany({});
  await projectModel.deleteMany({});
  await deliveryNoteModel.deleteMany({});

  // Crear un nuevo usuario de prueba
  const newUser = new userModel({
    name: "Test Boss",
    email: "projectUser@gmail.com",
    password: "123456789",
    verificated: true,
  });

  const user = await userModel.create(newUser);
  user_id = user._id;

  // Generar token de autenticación
  token = jwt.sign(
    {
      _id: user_id,
      role: user.role, // Aquí puedes agregar el rol si es necesario
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  // Crear cliente asociado
  const client = await clientModel.create({
    name: "Cliente Test",
    cif: "A12345678",
    user_id: user_id,
  });
  client_id = client._id;

  // Crear proyecto asociado
  const proyecto = await projectModel.create({
    client_id,
    projectCode: "B12338",
  });
  project_id = proyecto._id;

  albaranData = {
    project_id,
    client_id,
    format: "hours",
    entries: [
      {
        person: "Juan Pérez",
        hours: 5,
      },
      {
        person: "Laura Díaz",
        hours: 3,
      },
    ],
  };
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe("Crear un albarán", () => {
  const fakeId = new mongoose.Types.ObjectId();

  test("Crear un albarán correctamente", async () => {
    const response = await api.post("/api/deliverynote").set("Authorization", `Bearer ${token}`).send(albaranData);

    albaran_id = response.body.result._id;
    expect(response.status).toBe(201); // Verifica que la respuesta es 201
    expect(response.body.message).toBe("Albarán creado");
    expect(response.body.result).toHaveProperty("_id");
    expect(response.body.result.client_id.toString()).toBe(client_id.toString());
    expect(response.body.result.project_id.toString()).toBe(project_id.toString());
  });

  test("No crear el albarán si el cliente no existe", async () => {
    const response = await api
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        client_id: fakeId, // Cliente inválido
        project_id: project_id,
        format: "hours",
        entries: [{ person: "John Doe", hours: 5 }],
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Cliente no encontrado"); // El mensaje ahora debería existir
  });

  test("No crear el albarán si el proyecto no existe", async () => {
    const response = await api
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        client_id: client_id,
        project_id: fakeId, // Proyecto inválido
        format: "hours",
        entries: [{ person: "John Doe", hours: 5 }],
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Proyecto no encontrado"); // El mensaje ahora debería existir
  });
});

describe("Lista de albaranes", () => {
  test("Obtener todos los albaranes del usuario", async () => {
    const response = await api.get("/api/deliverynote").set("Authorization", `Bearer ${token}`).expect(200);

    expect(response.body).toHaveLength(1); // Asegurarse de que el albarán creado esté en la respuesta
    expect(response.body[0].client_id.toString()).toBe(client_id.toString());
    expect(response.body[0].project_id.toString()).toBe(project_id.toString());
  });

  test("No obtener albaranes si el usuario no tiene albaranes", async () => {
    // Crear otro usuario sin albaranes
    const newUser = new userModel({
      name: "Test User No Albaranes",
      email: "noAlbaranes@example.com",
      password: "123456789",
      verificated: true,
    });

    const user = await userModel.create(newUser);
    const newToken = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = await api.get("/api/deliverynote").set("Authorization", `Bearer ${newToken}`).expect(404);

    expect(response.body.message).toBe("No se encontraron albaranes para este usuario");
  });

  test("No devolver nada sin token", async () => {
    const response = await api.get("/api/deliverynote").expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });

  test("No devolver nada con token inválido", async () => {
    const response = await api.get("/api/deliverynote").set("Authorization", "Bearer invalidtoken").expect(401);
    expect(response.text).toBe("Error, el token JWT es incorrecto.");
  });
});

describe("Obtener albarán por ID", () => {
  test("Obtener un albarán correctamente", async () => {
    const response = await api
      .get(`/api/deliverynote/${albaran_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200); // Esperamos 200 OK

    expect(response.body._id.toString()).toBe(albaran_id.toString());
    expect(response.body.client_id._id.toString()).toBe(client_id.toString());
    expect(response.body.project_id._id.toString()).toBe(project_id.toString());
  });

  test("Error si el ID de albarán es inválido", async () => {
    const invalidId = "invalidId";
    const response = await api
      .get(`/api/deliverynote/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400); // Esperamos 400 Bad Request

    expect(response.body.message).toBe("ID de albarán inválido");
  });

  test("Error si el albarán no existe para el usuario", async () => {
    const fakeId = new mongoose.Types.ObjectId(); // Un ID que no está asociado al usuario
    const response = await api.get(`/api/deliverynote/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404); // Esperamos 404 Not Found

    expect(response.text).toBe("Albarán no encontrado para este usuario");
  });
});

describe("Descargar o generar PDF", () => {
  test("Generar un PDF correctamente", async () => {
    const response = await api
      .get(`/api/deliverynote/pdf/${albaran_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201); // Esperamos el código de estado 201, indicando que se ha generado el PDF

    expect(response.body.message).toBe("PDF creado correctamente");
    expect(response.body.url).toMatch(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//); // Verifica que la URL de IPFS esté presente
  });

  test("Redirigir al PDF si ya está disponible", async () => {
    // Supón que el albarán ya tiene un PDF generado previamente
    const pdfUrl = "https://gateway.pinata.cloud/ipfs/testhash";

    // Simulamos que el albarán tiene la URL del PDF en la base de datos
    await deliveryNoteModel.findByIdAndUpdate(albaran_id, { pdf_url: pdfUrl });

    const response = await api
      .get(`/api/deliverynote/pdf/${albaran_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(302); // Esperamos una redirección

    expect(response.headers.location).toBe(pdfUrl); // Verifica que la redirección sea a la URL correcta
  });

  test("Error si el albarán no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId(); // Un ID de albarán falso que no existe en la base de datos

    const response = await api
      .get(`/api/deliverynote/pdf/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404); // Esperamos el código de estado 404

    expect(response.text).toBe("Albarán no encontrado");
  });

  test("Error si el ID del albarán es inválido", async () => {
    const invalidId = "invalidId";

    const response = await api
      .get(`/api/deliverynote/pdf/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400); // Esperamos un error de tipo "Bad Request"

    expect(response.body.message).toBe("ID de albarán inválido");
  });
});

describe("Firmar albarán", () => {
  test("Firma un albarán correctamente", async () => {
    const response = await api
      .post(`/api/deliverynote/sign/${albaran_id}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("signature", Buffer.from("fake-image-content"), {
        //representa el contenido del archivo como un Buffer. Aquí usamos contenido falso porque no se necesita una imagen real para probar la lógica del endpoint.
        filename: "firma.png",
        contentType: "image/png",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Albaran firmado correctamente");
  });

  test("Error si no se sube firma", async () => {
    const response = await api.post(`/api/deliverynote/sign/${albaran_id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("No se subió imagen de firma");
  });

  test("Error si el albarán no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await api
      .post(`/api/deliverynote/sign/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("signature", Buffer.from("fake-image-content"), {
        filename: "firma.png",
        contentType: "image/png",
      });

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Albarán no encontrado");
  });

  test("Error si el ID del albarán es inválido", async () => {
    const response = await api
      .post("/api/deliverynote/sign/invalidId")
      .set("Authorization", `Bearer ${token}`)
      .attach("signature", Buffer.from("fake-image-content"), {
        filename: "firma.png",
        contentType: "image/png",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("ID de albarán inválido");
  });
});
