// backend/routes/PatientRoutes.js
const express = require("express");
const Patient = require("../models/patientModel");

const router = express.Router();

// 📌 Get all patients (No changes needed)
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ date: -1 }); // Sorting is a good practice
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients" });
  }
});

router.get("/check-name", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      // Don't search if the name is empty
      return res.json([]);
    }

    // Use a case-insensitive regular expression to find partial matches
    // 'i' flag makes it case-insensitive. This will match "john", "John Doe", "Johnson", etc.
    const searchRegex = new RegExp(name, "i");

    const potentialDuplicates = await Patient.find({ name: searchRegex })
      // We don't need the entire patient object, just enough to identify them.
      // This is good for performance and security.
      .select("name age phoneNumber address")
      .limit(5); // Limit to 5 results to avoid overwhelming the user

    res.json(potentialDuplicates);
  } catch (error) {
    console.error("Error checking for duplicate patient names:", error);
    res.status(500).json({ message: "Server error during duplicate check." });
  }
});

// 📌 Get a single patient by ID (No changes needed)
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient" });
  }
});

// 📌 Add a new patient (MODIFIED)
router.post("/", async (req, res) => {
  try {
    const { visitHistory, ...profileData } = req.body;

    // Create the new patient document with the provided data
    const newPatient = new Patient({
      ...profileData,
      visitHistory: visitHistory || [],
      // Financials will be calculated below
    });

    // --- Perform initial financial calculation ---
    const totalCharges = newPatient.visitHistory.reduce(
      (sum, visit) => sum + (visit.totalCharge || 0),
      0
    );
    const totalPaid = newPatient.visitHistory.reduce(
      (sum, visit) => sum + (visit.paidAmount || 0),
      0
    );
    const totalLabCharges = newPatient.visitHistory.reduce(
      (sum, visit) => sum + (visit.labCharge || 0),
      0
    );
    const totalSpecialistFees = newPatient.visitHistory.reduce(
      (sum, visit) => sum + (visit.specialistFee || 0),
      0
    );

    newPatient.pendingAmount = totalCharges - totalPaid;
    newPatient.totalEarnings =
      totalPaid - totalLabCharges - totalSpecialistFees;

    await newPatient.save();
    res
      .status(201)
      .json({ message: "Patient added successfully", patient: newPatient });
  } catch (error) {
    console.error("Error adding patient:", error);
    res
      .status(500)
      .json({ message: "Error adding patient", error: error.message });
  }
});

// 📌 Update a patient (SIMPLIFIED)
router.put("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const { visitHistory, ...profileData } = req.body;

    // A. Update the patient's core profile data
    Object.assign(patient, profileData);

    // B. Replace the entire visit history with the new one from the frontend
    if (Array.isArray(visitHistory)) {
      patient.visitHistory = visitHistory;
    }

    // C. Recalculate ALL cumulative financials from scratch
    const totalCharges = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.totalCharge || 0),
      0
    );
    const totalPaidDuringVisits = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.paidAmount || 0),
      0
    );
    const totalDuesPaid = patient.duesPaidHistory.reduce(
      (sum, due) => sum + (due.amount || 0),
      0
    );
    const totalPaidOverall = totalPaidDuringVisits + totalDuesPaid;

    const totalLabCharges = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.labCharge || 0),
      0
    );
    const totalSpecialistFees = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.specialistFee || 0),
      0
    );

    patient.pendingAmount = totalCharges - totalPaidOverall;
    patient.totalEarnings =
      totalPaidOverall - totalLabCharges - totalSpecialistFees;

    const updatedPatient = await patient.save();

    res.json({
      message: "Patient data updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patien:", error);
    res
      .status(500)
      .json({ message: "Error updating patient", error: error.message });
  }
});

// 📌 Delete a patient (No changes needed)
router.delete("/:id", async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient)
      return res.status(404).json({ message: "Patient not found" });

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting patient" });
  }
});

router.put("/update-financials/:id", async (req, res) => {
  try {
    const { newDuesPayment } = req.body;
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 1. Add the new dues payment to the patient's history.
    patient.duesPaidHistory.push(newDuesPayment);

    // 2. **RECALCULATE ALL CUMULATIVE FINANCIALS FROM SCRATCH**
    // This is the most robust method and guarantees data integrity.

    // Sum up all charges from all visits.
    const totalCharges = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.totalCharge || 0),
      0
    );

    // Sum up all payments made during visits.
    const totalPaidDuringVisits = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.paidAmount || 0),
      0
    );

    // Sum up all separate dues payments (including the one we just added).
    const totalDuesPaid = patient.duesPaidHistory.reduce(
      (sum, due) => sum + (due.amount || 0),
      0
    );

    const totalPaidOverall = totalPaidDuringVisits + totalDuesPaid;

    // Sum up all costs (labs and specialist fees).
    const totalLabCharges = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.labCharge || 0),
      0
    );
    const totalSpecialistFees = patient.visitHistory.reduce(
      (sum, visit) => sum + (visit.specialistFee || 0),
      0
    );

    // 3. Update the top-level financial fields with the new, correct totals.
    patient.pendingAmount = totalCharges - totalPaidOverall;
    patient.totalEarnings =
      totalPaidOverall - totalLabCharges - totalSpecialistFees;

    // 4. Save the fully updated patient document.
    const updatedPatient = await patient.save();

    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient financials:", error);
    res.status(500).json({ message: "Server error during financial update." });
  }
});

module.exports = router;
