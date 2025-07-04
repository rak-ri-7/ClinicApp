const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const PatientSchema = require("../models/patientModel");
const { parse, isValid } = require("date-fns");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseVisitHistory(summaryString) {
  if (!summaryString || typeof summaryString !== "string") return [];
  const lines = summaryString.split("\n");
  const visitHistory = [];

  for (const line of lines) {
    const duesMatch = line.match(
      /^(.*?): Dues Payment of ₹([\d.]+?) via (.*?)\./
    );
    if (duesMatch && duesMatch.length > 3) {
      const parsedDate = parse(duesMatch[1].trim(), "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        console.error(
          `Skipping dues payment due to invalid date: [${duesMatch[1]}]`
        );
        continue;
      }
      visitHistory.push({
        date: parsedDate,
        isDuesPayment: true,
        paidAmount: parseFloat(duesMatch[2]),
        paymentMode: duesMatch[3],
        doctor: "N/A",
        totalCharge: 0,
        pendingAmount: 0,
      });
      continue;
    }

    const visitMatch = line.match(
      /^(.*?) \(Dr. (.*?)\): \[Treatments: (.*?)\](?: \[Medicines: (.*?)\])? - Paid ₹([\d.]+?) via (.*?)$/
    );
    if (visitMatch && visitMatch.length > 6) {
      const [
        ,
        dateStr,
        doctor,
        treatmentsStr,
        medicinesStr,
        paidAmount,
        paymentMode,
      ] = visitMatch;

      // --- THE CORE FIX IS HERE ---
      const parsedDate = parse(dateStr.trim(), "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        console.error(`Skipping visit due to invalid date: [${dateStr}]`);
        continue;
      }

      const treatments =
        treatmentsStr === "N/A"
          ? []
          : treatmentsStr.split(", ").map((t) => {
              const match = t.match(/(.*?) \(₹([\d.]+?)\)/);
              return match
                ? { name: match[1], price: parseFloat(match[2]) }
                : { name: t, price: 0 };
            });
      const medicines = !medicinesStr
        ? []
        : medicinesStr.split(", ").map((m) => {
            const match = m.match(/(.*?) \(Qty:(\d+)\)/);
            return match
              ? {
                  name: match[1],
                  quantity: parseInt(match[2], 10),
                  pricePerUnit: 0,
                }
              : { name: m, quantity: 1, pricePerUnit: 0 };
          });

      visitHistory.push({
        date: parsedDate, // <--- USING THE CORRECT, PARSED DATE OBJECT
        doctor,
        treatments,
        medicines,
        paidAmount: parseFloat(paidAmount),
        paymentMode,
        isDuesPayment: false,
      });
    }
  }
  return visitHistory;
}

function parseDentalChart(chartString) {
  if (!chartString || chartString === "N/A") return {};
  const chart = {};
  const entries = chartString.split("; \n");
  entries.forEach((entry) => {
    const parts = entry.split(": ");
    if (parts.length === 2) {
      const toothMatch = parts[0].match(/Tooth (\d+)/);
      if (toothMatch) {
        chart[toothMatch[1]] = parts[1].split(", ");
      }
    }
  });
  return chart;
}

router.post("/import/excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ message: "The Excel sheet is empty." });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        if (!row["Name"]) {
          throw new Error("Row is missing a 'Name'.");
        }

        let visitHistory = parseVisitHistory(
          row["Visit & Payment History (Chronological)"]
        );
        let cumulativeCharge = 0,
          cumulativePaid = 0;

        visitHistory = visitHistory.map((visit) => {
          let visitCharge = 0;
          if (!visit.isDuesPayment) {
            visitCharge = (visit.treatments || []).reduce(
              (sum, t) => sum + (t.price || 0),
              0
            );
            cumulativeCharge += visitCharge;
          }
          cumulativePaid += visit.paidAmount;
          return {
            ...visit,
            visitCharge,
            totalCharge: cumulativeCharge,
            pendingAmount: cumulativeCharge - cumulativePaid,
          };
        });

        let nextAppointmentDate = null;
        if (row["Next Appointment"] && row["Next Appointment"] !== "N/A") {
          const parsedDate = parse(
            String(row["Next Appointment"]).trim(),
            "yyyy-MM-dd",
            new Date()
          );
          if (isValid(parsedDate)) {
            nextAppointmentDate = parsedDate;
          }
        }

        const patientDocument = {
          name: row["Name"],
          age: row["Age"],
          gender: row["Gender"],
          phoneNumber: row["Phone Number"],
          address: row["Address"],
          additionalInfo: row["Additional Info"],
          medicalHistory: row["Medical History"],
          dentalHistory: row["Dental History"],
          chiefComplaint: row["Chief Complaint"],
          oralNotes: row["OE Notes"],
          dentalChart: parseDentalChart(row["Oral Examination / Dental Chart"]),
          nextAppointment: nextAppointmentDate,
          treatmentPlan: row["Treatment Plan"],
          treatments: row["Treatments"],
          medicines: row["Medicines"],
          medicineCharges: row["Medicine Charges"],
          includeConsultationFee: row["Include Consultation Fee"] === "Yes",
          includeXRayCharges: row["Include X-Ray Charges"] === "Yes",
          selectedLab: row["Selected Lab"] || "",
          labCharge: row["Lab Charges"] || 0,
          totalEarnings: row["Total Clinic Earnings"],
          pendingAmount: row["Final Pending Amount"],
          visitHistory: visitHistory,
        };

        await PatientSchema.findOneAndUpdate(
          { name: patientDocument.name },
          patientDocument,
          { upsert: true, runValidators: true }
        );
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(
          `Row ${index + 2} (Patient: ${row["Name"] || "Unknown"}): ${
            err.message
          }`
        );
        console.error(`Error processing row ${index + 2}:`, err);
      }
    }

    if (errorCount > 0) {
      return res.status(400).json({
        message: `Import finished with ${errorCount} error(s) and ${successCount} success(es). Please check the details.`,
        errors,
      });
    }

    res.status(200).json({
      message: `${successCount} patient records have been successfully imported/updated.`,
    });
  } catch (err) {
    console.error("Fatal Excel import error:", err);
    res.status(500).json({
      message: "A fatal error occurred during the import process.",
      error: err.message,
    });
  }
});

module.exports = router;
