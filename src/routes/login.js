const express = require("express");
const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  console.log("\nHTTP method: POST, Route: /api/login");
});

module.exports = loginRouter;
