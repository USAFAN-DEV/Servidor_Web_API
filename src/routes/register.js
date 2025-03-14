const express = require("express");
const registerRouter = express.Router();

registerRouter.get("/", async (req, res) => {
  console.log("\nHTTP method: GET, Route: /api/register");
});

registerRouter.put("/", async (req, res) => {
  console.log("\nHTTP method: PUT, Route: /api/register");
});

module.exports = registerRouter;
