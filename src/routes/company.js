const express = require("express");
const companyRouter = express.Router();

companyRouter.patch("/", async (req, res) => {
  console.log("\nHTTP method: PATCH, Route: /api/company");
});

module.exports = companyRouter;
