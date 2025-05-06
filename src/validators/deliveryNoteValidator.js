const { check, body } = require("express-validator");
const validateResults = require("../utils/handleValidator.js");

const createDeliveryNoteValidator = [
  check("project_id", "El ID del proyecto es obligatorio").isMongoId(),

  check("client_id", "El ID del cliente es obligatorio").isMongoId(),

  check("format", "El formato debe ser 'hours', 'materials' o 'mixed'").isIn(["hours", "materials", "mixed"]),

  check("entries", "Debe incluir al menos una entrada").isArray({ min: 1 }),

  body("entries").custom((entries, { req }) => {
    const format = req.body.format;

    for (const entry of entries) {
      if (format === "hours") {
        if (!entry.person || typeof entry.hours !== "number") {
          throw new Error("Cada entrada de horas debe incluir 'person' y 'hours'");
        }
      } else if (format === "materials") {
        if (!entry.material || typeof entry.quantity !== "number") {
          throw new Error("Cada entrada de materiales debe incluir 'material' y 'quantity'");
        }
      } else if (format === "mixed") {
        const isHoursEntry = entry.person && typeof entry.hours === "number";
        const isMaterialEntry = entry.material && typeof entry.quantity === "number";

        if (!isHoursEntry && !isMaterialEntry) {
          throw new Error("Cada entrada mixta debe ser válida como entrada de horas o de materiales");
        }
      }
    }

    return true;
  }),

  (req, res, next) => validateResults(req, res, next),
];

module.exports = { createDeliveryNoteValidator };
