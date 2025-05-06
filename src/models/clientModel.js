const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const ClientSchema = new mongoose.Schema(
  {
    name: String,
    cif: String,
    address: {
      street: String,
      number: Number,
      postal: String,
      city: String,
      province: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true, versionKey: false }
);

ClientSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("clients", ClientSchema);
