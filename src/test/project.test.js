//Librerias
const supertest = require("supertest");
const mongoose = require("mongoose"); //Para trabajar con mongo
const jwt = require("jsonwebtoken");

//Main
const { app, server } = require("../app.js");

//Modelos
const projectModel = require("../models/projectModel.js");
const userModel = require("../models/userModel.js");
const clientModel = require("../models/clientModel.js");

//Config
const api = supertest(app);

//Datos de prueba
let token;
let user_id;
let client_id;
let project_id;

let projectData;

let token2;

const extraProjectData = {
  name: "Proyecto Prueba",
  address: {
    street: "Calle Falsa",
    number: 123,
    postal: "28080",
    city: "Madrid",
    province: "Madrid",
  },
};

// Setup y Teardown
beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once("connected", resolve));

  await userModel.deleteMany({});
  await clientModel.deleteMany({});
  await projectModel.deleteMany({});

  // Crea un nuevo usuario de prueba
  const newUser = new userModel({
    name: "Test Boss",
    email: "projectUser@gmail.com",
    password: "123456789",
    verificated: true,
  });

  const user = await userModel.create(newUser);
  user_id = user._id;

  const newUser2 = new userModel({
    name: "Test Boss",
    email: "projectUser2@gmail.com",
    password: "123456789",
    verificated: true,
  });
  const user2 = await userModel.create(newUser2);

  token = jwt.sign(
    {
      _id: user_id,
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

  // Crear cliente asociado
  const client = await clientModel.create({
    name: "Cliente Test",
    cif: "A12345678",
    user_id: user_id,
  });
  client_id = client._id;

  projectData = {
    projectCode: "PROJ001",
    client_id: client_id,
  };
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe("Crear un proyecto", () => {
  test("Crear un proyecto nuevo exitosamente", async () => {
    const response = await api
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send(projectData)
      .expect(201);

    project_id = response.body.result._id;
    expect(response.body).toHaveProperty("message", "Proyecto creado.");
    expect(response.body.result).toHaveProperty("projectCode", "PROJ001");
  });

  test("No crear un proyecto si se repite el mismo projectCode para el mismo cliente y usuario", async () => {
    const response = await api
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send(projectData)
      .expect(409);

    expect(response.text).toContain("Ya existe un proyecto con ese código");
  });

  test("No crear un proyecto si el cliente no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const fakeClientProject = {
      projectCode: "PROJ001",
      client_id: fakeId,
    };

    const response = await api
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send(fakeClientProject)
      .expect(404);

    expect(response.text).toBe("El cliente del proyecto no existe.");
  });

  test("No crear un proyecto sin token", async () => {
    const response = await api.post("/api/project").send(projectData).expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Actualizar información del proyecto", () => {
  test("Actualizar la informacion del proyecto exitosamente", async () => {
    const response = await api
      .patch(`/api/project/${project_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(extraProjectData)
      .expect(200);

    expect(response.body.message).toBe("Proyecto actualizado");

    const updatedProject = await projectModel.findById(project_id);
    expect(updatedProject.name).toBe(extraProjectData.name);
  });

  test("No actualizar la informacion de un proyecto inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await api
      .patch(`/api/project/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(extraProjectData)
      .expect(404);

    expect(response.text).toContain("No se ha encontrado el proyecto");
  });

  test("No actualizar la informacion del proyecto sin token", async () => {
    const response = await api.patch(`/api/project/${project_id}`).send(extraProjectData).expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Obtener los proyectos del usuario", () => {
  test("Devolver los proyectos del usuario", async () => {
    const response = await api.get("/api/project").set("Authorization", `Bearer ${token}`).expect(200);

    expect(response.body.message).toBe("Proyectos encontrados");
    expect(Array.isArray(response.body.result)).toBe(true);
    expect(response.body.result[0].projectCode).toBe(projectData.projectCode);
  });

  test("No devolver nada si el usuario no tiene proyectos", async () => {
    const response = await api.get("/api/project").set("Authorization", `Bearer ${token2}`).expect(404);
    expect(response.body.message).toContain("No se encontraron proyectos");
  });

  test("No devolver nada si no hay token", async () => {
    const response = await api.get("/api/project").expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Obtener un proyecto por id", () => {
  test("Obtener un proyecto por id exitosamente", async () => {
    const response = await api.get(`/api/project/${project_id}`).set("Authorization", `Bearer ${token}`).expect(200);

    expect(response.body.message).toBe("Proyecto encontrado");
    expect(response.body.result._id).toBe(project_id);
  });

  test("No devolver nada si el proyecto no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await api.get(`/api/project/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404);
    expect(response.body.message).toBe("No se ha encontrado el proyecto.");
  });

  test("No devolver el proyecto si no hay token", async () => {
    const response = await api.get(`/api/project/${project_id}`).expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Archivar un proyecto", () => {
  test("Archivar un proyecto exitosamente", async () => {
    const response = await api
      .patch(`/api/project/archive/${project_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe("Proyecto archivado correctamente.");

    const archived = await projectModel.findOneDeleted({ _id: project_id });
    expect(archived).not.toBeNull();
    expect(archived.deleted).toBe(true);
  });

  test("No archivar un proyecto que no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await api
      .patch(`/api/project/archive/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
    expect(response.text).toBe("Proyecto no encontrado");
  });

  test("No archivar un proyecto sin token", async () => {
    const response = await api.patch(`/api/project/archive/${project_id}`).expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Eliminar un proyecto", () => {
  let deletedProject_id;
  beforeAll(async () => {
    const project = await projectModel.create({
      name: "Proyecto Temporal",
      projectCode: "DEL001",
      address: {
        street: "Calle Temporal",
        number: 101,
        postal: 28001,
        city: "Valencia",
        province: "Valencia",
      },
      user_id: user_id,
      client_id: client_id,
    });

    deletedProject_id = project._id;
  });
  test("Elimina un proyecto permanentemente", async () => {
    const response = await api
      .delete(`/api/project/${deletedProject_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe("Proyecto eliminado permanentemente");
    const deleted = await projectModel.findById(deletedProject_id);
    expect(deleted).toBeNull();
  });

  test("No eliminar un proyecto que no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await api.delete(`/api/project/${fakeId}`).set("Authorization", `Bearer ${token}`).expect(404);

    expect(response.text).toBe("Proyecto no encontrado");
  });

  test("No eliminar el proyecto sin token", async () => {
    const response = await api.delete(`/api/project/${deletedProject_id}`).expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Listar proyectos archivados", () => {
  test("Devuelve los proyectos archivados correctamente", async () => {
    const response = await api.get("/api/project/archived/list").set("Authorization", `Bearer ${token}`).expect(200);

    expect(response.body.message).toBe("Proyectos archivados encontrados");
    expect(Array.isArray(response.body.result)).toBe(true);
    const archived = response.body.result.find((c) => c._id === project_id.toString());
    expect(archived).toBeDefined();
  });

  test("No devuelve nada si no hay proyectos archivados", async () => {
    const response = await api.get("/api/project/archived/list").set("Authorization", `Bearer ${token2}`).expect(404);
    expect(response.text).toBe("No existen proyectos archivados.");
  });

  test("No devuelve nada sin token", async () => {
    const response = await api.get("/api/project/archived/list").expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});

describe("Restaurar un proyecto archivado", () => {
  test("Restaura correctamente un proyecto archivado", async () => {
    const response = await api
      .patch(`/api/project/restore/${project_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe("Proyecto restaurado correctamente.");

    const restoredProject = await projectModel.findOne({ _id: project_id, user_id });
    expect(restoredProject).not.toBeNull();
    expect(restoredProject.deleted).toBeFalsy();
  });

  test("No restaurar nada si el id es invalido", async () => {
    const response = await api
      .patch("/api/project/restore/invalid-id")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(response.text).toBe("ID de projecto no válido.");
  });

  test("No restaurar nada si el proyecto no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await api
      .patch(`/api/project/restore/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(response.text).toBe("Proyecto no encontrado o no está archivado");
  });

  test("No devolver nada si no hay token", async () => {
    const response = await api.patch(`/api/project/restore/${project_id}`).expect(403);
    expect(response.text).toBe("Error, no cuentas con la autorización requerida.");
  });
});
