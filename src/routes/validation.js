const express = require("express");
const validationRouter = express.Router();

validationRouter.put("/", async (req, res) => {
  console.log("\nHTTP method: PUT, Route: /api/validation");
});

module.exports = validationRouter;
