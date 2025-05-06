const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const ProjectSchema = new mongoose.Schema(
  {
    name: "String",
    projectCode: "String",
    address: {
      street: String,
      number: Number,
      postal: Number,
      city: String,
      province: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
    },
  },
  { timestamps: true, versionKey: false }
);

ProjectSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("projects", ProjectSchema);
