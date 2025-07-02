const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const PatientSchema = require("../models/patientModel");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/import/excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Optional: Validate or sanitize `data` before inserting
    await PatientSchema.insertMany(data); // Make sure data matches your schema

    res.status(200).json({ message: "Data imported successfully" });
  } catch (err) {
    console.error("Excel import error:", err);
    res.status(500).json({ error: "Failed to import data" });
  }
});

module.exports = router;
