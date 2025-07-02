const express = require("express");
const Doctor = require("../models/doctorModel");

const router = express.Router();

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new doctor
router.post("/", async (req, res) => {
  const { name, specialization, experience, percentageCut, additionalInfo } =
    req.body;

  const doctor = new Doctor({
    name,
    specialization,
    experience,
    percentageCut,
    role: "Specialist Doctor",
    additionalInfo,
  });

  try {
    const newDoctor = await doctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updateDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body, // Updates all provided fields
      },
      { new: true }
    );
    if (!updateDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(updateDoctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
