const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    password: String,
    status: {
      type: Boolean,
      default: false,
    },
    code: String,
    role: {
      type: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true, versionKey: false }
);

//UserSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("users", UserSchema);
