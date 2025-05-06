const mongoose = require("mongoose");

const DeliveryNoteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    format: {
      type: String,
      enum: ["hours", "materials", "mixed"],
    },
    entries: [
      {
        person: String,
        hours: Number,
        material: String,
        quantity: Number,
      },
    ],
    signed: {
      type: Boolean,
      default: false,
    },
    signature_url: String,
    pdf_url: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("deliverynotes", DeliveryNoteSchema);
