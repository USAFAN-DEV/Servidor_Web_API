const express = require("express");
const registerRouter = express.Router();
const createUser = require("../controllers/users.js");
const validatorUser = require("../validators/users.js");

registerRouter.post("/", validatorUser, createUser);

registerRouter.put("/", async (req, res) => {
  console.log("\nHTTP method: PUT, Route: /api/register");
});

module.exports = registerRouter;
