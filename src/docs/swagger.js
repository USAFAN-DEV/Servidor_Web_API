const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Tracks - Express API with Swagger (OpenAPI 3.0)",
      version: "0.1.0",
      description: "This is a CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "u-tad",
        url: "https://u-tad.com",
        email: "ricardo.palacios@u-tad.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        registerUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "email123@gmail.com",
            },
            password: {
              type: "string",
            },
            name: {
              type: "string",
              example: "Ricardo",
            },
            surname: {
              type: "string",
              example: "Palacios",
            },
          },
        },
        loginUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "miemail@google.com",
            },
            password: {
              type: "string",
              example: "123",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
