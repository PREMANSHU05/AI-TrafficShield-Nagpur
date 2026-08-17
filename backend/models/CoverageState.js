const mongoose = require("mongoose");

const coverageLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    currentOfficers: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const coverageStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "current" },
    locations: { type: [coverageLocationSchema], default: [] },
    availableOfficers: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CoverageState", coverageStateSchema);
