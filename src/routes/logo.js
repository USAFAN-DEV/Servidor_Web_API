const express = require("express");
const logoRouter = express.Router();

logoRouter.patch("/", async (req, res) => {
  console.log("\nHTTP method: PATCH, Route: /api/logo");
});

module.exports = logoRouter;
