const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
    },
    updatedRisk: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    officers: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Incident", incidentSchema);
