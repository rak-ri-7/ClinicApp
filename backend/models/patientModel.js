const mongoose = require("mongoose");

// Sub-schema for a single medicine entry (no changes)
const DispensedMedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true }, // The quantity GIVEN to the patient
    pricePerUnit: { type: Number, required: true }, // The price at the time of dispensing
  },
  { _id: false }
);

// Sub-schema for a single treatment entry (no changes)
const TreatmentDetailSchema = new mongoose.Schema(
  {
    name: { type: String },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

// *** NEW: A sub-schema for a single, complete visit record ***
// This will be the structure for each item in our main history array.
const VisitHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  doctor: { type: String, required: true },
  chiefComplaint: { type: String },
  treatmentPlan: { type: String },
  treatments: [TreatmentDetailSchema],
  medicines: [DispensedMedicineSchema],
  labCharge: { type: Number, default: 0 },
  selectedLab: { type: String, default: "" },
  specialistFee: { type: Number, default: 0 },
  totalCharge: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  pendingAmount: { type: Number, required: true, default: 0 },
  paymentMode: { type: String, enum: ["Cash", "Gpay"] },
  isConsultationOnly: { type: Boolean, default: false },
  includeConsultationFee: { type: Boolean, default: false },
  includeXrayFee: { type: Boolean, default: false },
  isDuesPayment: { type: Boolean, default: false },
  visitCharge: { type: Number, default: 0 },
});

const PatientSchema = new mongoose.Schema(
  {
    // --- Core Patient Profile Fields (Unchanged) ---
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    address: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    additionalInfo: { type: String, default: "" },
    medicalHistory: { type: String, default: "" },
    dentalHistory: { type: String },
    dentalChart: { type: Map, of: [String], default: {} },
    oralNotes: { type: String },

    // --- Top-level Financials & Appointments (Still useful for quick access) ---
    // These represent the CUMULATIVE or OVERALL status.
    totalEarnings: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    nextAppointment: { type: Date, default: null },

    // --- REPLACEMENT OF MULTIPLE HISTORY ARRAYS ---
    visitHistory: [VisitHistorySchema], // The new single source of truth for all visits

    // Dues paid history is separate and remains the same
    duesPaidHistory: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        paymentMode: { type: String, enum: ["Cash", "Gpay"], default: "Cash" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", PatientSchema);
