const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "Specialist Doctor" },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  percentageCut: { type: Number, required: true },
  additionalInfo: {
    type: String,
    default: "",
  },
  paymentModel: {
    type: String,
    enum: ["Percentage", "Fixed"],
    default: "Percentage",
    required: true,
  },
  role: { type: String },
});

module.exports = mongoose.model("Doctor", doctorSchema);
