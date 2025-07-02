// backend/models/PatientModel.js
const mongoose = require("mongoose");

const InventoryMedicineSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  quantity: { type: Number, required: true }, // Total quantity IN STOCK
  pricePerUnit: { type: Number },
  lowStockThreshold: { type: Number, required: true, default: 10 },
});

const TreatmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: { type: [String], default: [] },
});

const LabSchema = new mongoose.Schema({
  name: { type: String },
});

const InventorySchema = new mongoose.Schema({
  medicines: [InventoryMedicineSchema], // Stores all medicines
  treatments: [TreatmentSchema], // Stores all treatments
  labs: [LabSchema],
});

module.exports = mongoose.model("Inventory", InventorySchema);
