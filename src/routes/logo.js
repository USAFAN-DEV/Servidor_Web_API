//Express
const express = require("express");
const logoRouter = express.Router();
//Controllers
const createItem = require("../controllers/logoController.js");
//Middleware
const authMiddleware = require("../middleware/session.js");
//Utils
const { uploadMiddleware } = require("../utils/handleStorage.js");

logoRouter.post("/", authMiddleware, uploadMiddleware.single("image"), createItem);

module.exports = logoRouter;
