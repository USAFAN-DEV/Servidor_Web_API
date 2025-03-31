const mongoose = require("mongoose");

const logoScheme = new mongoose.Schema(
  {
    url: String,
    filename: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("logos", logoScheme);
