//Librerias
const supertest = require("supertest");
const mongoose = require("mongoose"); //Para trabajar con mongo
const jwt = require("jsonwebtoken");

//Main
const { app, server } = require("../app.js");

//Modelos
const userModel = require("../models/userModel.js");
const clientModel = require("../models/clientModel.js");

//Config
const api = supertest(app);

//Datos de prueba
let token;
let token2;
let client_id;
let user_id;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));

  await userModel.deleteMany({});
  await clientModel.deleteMany({});

  // Crea un nuevo usuario de prueba
  const newUser = new userModel({
    name: "Test Boss",
    email: "clientUser@gmail.com",
    password: "123456789",
    verificated: true,
  });

  const newUser2 = new userModel({
    name: "Test Boss",
    email: "clientUser2@gmail.com",
    password: "123456789",
    verificated: true,
  });

  const user = await userModel.create(newUser);
  user_id = user._id;

  const user2 = await userModel.create(newUser2);

  token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  token2 = jwt.sign(
    {
      _id: user2._id,
      role: user2.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

//Tests
describe("Crear un cliente", () => {
  const clientData = {
    name: "Empresa S.A.",
    cif: "A12345678",
  };

  test("Crea un cliente exitosamente", async () => {
    const response = await api.post("/api/client").set("Authorization", `Bearer ${token}`).send(clientData).expect(201);

    expect(response.body.message).toBe("Cliente creado.");
    expect(response.body.result).toHaveProperty("cif", clientData.cif);
    client_id = response.body.result._id;
  });

  test("Error si el cliente ya existe con el mismo CIF", async () => {
    const response = await api.post("/api/client").set("Authorization", `Bearer ${token}`).send(clientData).expect(409);

    expect(response.text).toBe("Ya existe un cliente con ese CIF para este usuario.");
  });

  test("Error si no se proporciona un token", async () => {
    const response = await api.post("/api/client").send(clientData).expect(403);

    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Actualizar información cliente", () => {
  const updatedClientData = {
    name: "Empresa S.A.",
    cif: "A12345678",
    address: {
      street: "Calle Falsa",
      number: 123,
      postal: "28080",
      city: "Madrid",
      province: "Madrid",
    },
  };

  test("Actualiza un cliente correctamente", async () => {
    const response = await api
      .patch("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedClientData)
      .expect(200);

    expect(response.body.message).toBe("Información actualizada");
    expect(response.body.result.matchedCount).toBe(1);

    const updatedClient = await clientModel.findOne({ cif: updatedClientData.cif });
    expect(updatedClient).not.toBeNull(); // Verifica que exista realmente
    expect(updatedClient.name).toBe(updatedClientData.name);
    expect(updatedClient.address.postal).toBe(updatedClientData.address.postal);
  });

  test("Error si el cliente no existe", async () => {
    const fakeUpdate = {
      name: "Empresa S.A.",
      cif: "B12345678",
      address: {
        street: "Calle Falsa",
        number: 123,
        postal: "28080",
        city: "Madrid",
        province: "Madrid",
      },
    };

    const response = await api
      .patch("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send(fakeUpdate)
      .expect(404);

    expect(response.text).toBe("El cliente no existe en la base de datos.");
  });

  test("Error si no se proporciona un token", async () => {
    const response = await api.patch("/api/client").send(updatedClientData).expect(403);

    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Obtener clientes del usuario", () => {
  test("Devuelve los clientes correctamente", async () => {
    const res = await api.get("/api/client").set("Authorization", `Bearer ${token}`).expect(200);

    expect(res.body).toHaveProperty("message", "Clientes encontrados");
    expect(res.body.result[0].cif).toBe("A12345678");
  });

  test("Devuelve 404 si el usuario no tiene clientes", async () => {
    const res = await api.get("/api/client").set("Authorization", `Bearer ${token2}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "No se encontraron clientes para este usuario.");
  });

  test("Devuelve 403 si no se proporciona token", async () => {
    const res = await api.get("/api/client");

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Obtener un cliente por id", () => {
  test("Devuelve un cliente exitosamente", async () => {
    const res = await api.get(`/api/client/${client_id}`).set("Authorization", `Bearer ${token}`).expect(200);

    expect(res.body.message).toBe("Cliente encontrado");
    expect(res.body.result._id).toBe(client_id);
    expect(res.body.result.cif).toBe("A12345678");
  });

  test("Devuelve 400 si el ID no es válido", async () => {
    const res = await api.get("/api/client/invalid-id").set("Authorization", `Bearer ${token}`).expect(400);

    expect(res.text).toBe("ID de cliente no válido");
  });

  test("Devuelve 404 si el cliente no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await api.get(`/api/client/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404);

    expect(res.text).toBe("Cliente no encontrado");
  });

  test("Devuelve 403 si no se proporciona token", async () => {
    const res = await api.get(`/api/client/${client_id}`).expect(403);

    expect(res.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Archivar (soft delete) un cliente", () => {
  test("Archiva un cliente correctamente", async () => {
    const res = await api.patch(`/api/client/${client_id}`).set("Authorization", `Bearer ${token}`).expect(200);

    expect(res.body.message).toBe("Cliente archivado correctamente.");

    // Verifica en base de datos que esté archivado (soft deleted)
    const archivedClient = await clientModel.findOneDeleted({ _id: client_id });
    expect(archivedClient).not.toBeNull();
    expect(archivedClient.deleted).toBe(true);
  });

  test("Devuelve 400 si el ID no es válido", async () => {
    const res = await api.patch("/api/client/1234").set("Authorization", `Bearer ${token}`).expect(400);

    expect(res.text).toBe("ID de cliente no válido");
  });

  test("Devuelve 404 si el cliente no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await api.patch(`/api/client/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404);

    expect(res.text).toBe("Cliente no encontrado");
  });

  test("Devuelve 403 si no se proporciona token", async () => {
    await api.patch(`/api/client/${client_id}`).expect(403);
  });
});

describe("Eliminar un cliente permanentemente (hard delete)", () => {
  test("Elimina permanentemente un cliente correctamente", async () => {
    const res = await api.delete(`/api/client/${client_id}`).set("Authorization", `Bearer ${token}`).expect(200);

    expect(res.body.message).toBe("Cliente eliminado permanentemente");

    const client = await clientModel.findById(client_id);
    expect(client).toBeNull(); // Verifica que no esté ni siquiera archivado
  });

  test("Devuelve 400 si el ID no es válido", async () => {
    const res = await api.delete("/api/client/invalid-id").set("Authorization", `Bearer ${token}`).expect(400);

    expect(res.text).toBe("ID de cliente no válido");
  });

  test("Devuelve 404 si el cliente no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await api.delete(`/api/client/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404);

    expect(res.text).toBe("Cliente no encontrado");
  });

  test("Devuelve 403 si no se proporciona token", async () => {
    await api.delete(`/api/client/${client_id}`).expect(403);
  });
});

describe("Listar clientes archivados", () => {
  let archivedClientId;

  beforeAll(async () => {
    // Crear un cliente y archivarlo
    const client = await clientModel.create({
      name: "Cliente Archivado",
      cif: "ARCH123456",
      user_id: user_id,
    });

    archivedClientId = client._id;

    // Soft delete (archivar)
    await clientModel.delete({ _id: archivedClientId, user_id: user_id });
  });

  test("Devuelve los clientes archivados correctamente", async () => {
    const res = await api.get("/api/client/archived/list").set("Authorization", `Bearer ${token}`).expect(200);

    expect(res.body.message).toBe("Clientes archivados encontrados");
    expect(Array.isArray(res.body.result)).toBe(true);
    const archived = res.body.result.find((c) => c._id === archivedClientId.toString());
    expect(archived).toBeDefined();
  });

  test("Devuelve 404 si no hay clientes archivados", async () => {
    const res = await api.get("/api/client/archived/list").set("Authorization", `Bearer ${token2}`).expect(404);

    expect(res.text).toBe("No existen clientes archivados");
  });

  test("Devuelve 403 si no se proporciona token", async () => {
    await api.get("/api/client/archived/list").expect(403);
  });
});

describe("Restaurar un cliente archivado", () => {
  let clientToRestoreId;

  beforeAll(async () => {
    // Crear y archivar cliente
    const client = await clientModel.create({
      name: "Cliente Restaurable",
      cif: "REST123456",
      user_id: user_id,
      address: {
        street: "Calle Restore",
        number: 88,
        postal: 55555,
        city: "RestoreCity",
        province: "Restauria",
      },
    });

    clientToRestoreId = client._id;

    // Soft delete
    await clientModel.delete({ _id: clientToRestoreId, user_id: user_id });
  });

  test("Restaura correctamente un cliente archivado", async () => {
    const res = await api
      .patch(`/api/client/restore/${clientToRestoreId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe("Cliente restaurado correctamente.");

    const restoredClient = await clientModel.findOne({ _id: clientToRestoreId, user_id });
    expect(restoredClient).not.toBeNull();
    expect(restoredClient.deleted).toBeFalsy();
  });

  test("Devuelve 400 si el ID es inválido", async () => {
    const res = await api.patch("/api/client/restore/invalid-id").set("Authorization", `Bearer ${token}`).expect(400);

    expect(res.text).toBe("ID de cliente no válido");
  });

  test("Cliente inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await api.patch(`/api/client/restore/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404);

    expect(res.text).toBe("Cliente no encontrado o no está archivado");
  });

  test("Devuelve 403 si no se proporciona token", async () => {
    await api.patch(`/api/client/restore/${clientToRestoreId}`).expect(403);
  });
});
