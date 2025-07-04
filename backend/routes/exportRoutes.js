const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const PatientSchema = require("../models/patientModel");

// Helper function to safely format dates
const formatDate = (date) => {
  if (!date || !new Date(date).getTime()) {
    // Check if date is null, undefined, or invalid
    return "N/A";
  }
  // Return in YYYY-MM-DD format
  return new Date(date).toISOString().split("T")[0];
};

router.get("/excel", async (req, res) => {
  try {
    const patients = await PatientSchema.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Patients Summary");

    // --- Columns are fine, no changes needed here ---
    worksheet.columns = [
      // ... your existing columns
      { header: "Name", key: "name", width: 25 },
      { header: "Age", key: "age", width: 8 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Additional Info", key: "additionalInfo", width: 40 },
      { header: "Total Charges", key: "totalCharges", width: 15 },
      {
        header: "Total Treatment Charges",
        key: "totalTreatmentCharges",
        width: 20,
      },
      {
        header: "Total Medicine Charges",
        key: "totalMedicineCharges",
        width: 20,
      },
      { header: "Total Lab Charges", key: "totalLabCharges", width: 18 },
      { header: "Total Paid", key: "totalPaid", width: 15 },
      { header: "Final Pending Amount", key: "finalPending", width: 20 },
      { header: "Total Clinic Earnings", key: "totalEarnings", width: 20 },
      { header: "Number of Visits", key: "visitCount", width: 15 },
      { header: "First Visit Date", key: "firstVisitDate", width: 15 },
      { header: "Last Visit Date", key: "lastVisitDate", width: 15 },
      { header: "Next Appointment", key: "nextAppointment", width: 20 },
      { header: "All Doctors Seen", key: "allDoctors", width: 30 },
      { header: "All Lab Work Done", key: "allLabWork", width: 30 },
      {
        header: "Visit & Payment History (Chronological)",
        key: "visitSummary",
        width: 80,
      },
      { header: "Medical History", key: "medicalHistory", width: 40 },
      { header: "Dental History", key: "dentalHistory", width: 40 },
      {
        header: "Oral Examination / Dental Chart",
        key: "dentalChart",
        width: 50,
      },
      { header: "OE Notes", key: "oralNotes", width: 40 },
    ];

    for (const patient of patients) {
      let rowData = {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        address: patient.address,
        additionalInfo: patient.additionalInfo,
        medicalHistory: patient.medicalHistory,
        dentalHistory: patient.dentalHistory,
        oralNotes: patient.oralNotes,
        // --- THE FIX: Use the safe formatDate helper ---
        nextAppointment: formatDate(patient.nextAppointment),
        totalEarnings: patient.totalEarnings || 0,
        dentalChart: "N/A",
      };

      if (patient.dentalChart && Object.keys(patient.dentalChart).length > 0) {
        rowData.dentalChart = Object.entries(patient.dentalChart)
          .map(
            ([tooth, conditions]) => `Tooth ${tooth}: ${conditions.join(", ")}`
          )
          .join("; \n");
      }

      if (patient.visitHistory && patient.visitHistory.length > 0) {
        const visitHistory = patient.visitHistory;
        const lastVisit = visitHistory[visitHistory.length - 1];

        const totalCharges = lastVisit.totalCharge || 0;
        const totalPaid = visitHistory.reduce(
          (sum, v) => sum + (v.paidAmount || 0),
          0
        );
        const finalPending = totalCharges - totalPaid;
        const totalTreatmentCharges = visitHistory.reduce(
          (sum, v) =>
            sum +
            (v.treatments?.reduce((vSum, t) => vSum + (t.price || 0), 0) || 0),
          0
        );
        const totalMedicineCharges = visitHistory.reduce(
          (sum, v) =>
            sum +
            (v.medicines?.reduce(
              (vSum, m) => vSum + (m.pricePerUnit || 0) * (m.quantity || 0),
              0
            ) || 0),
          0
        );
        const totalLabCharges = visitHistory.reduce(
          (sum, v) => sum + (v.labCharge || 0),
          0
        );
        const allDoctors = [
          ...new Set(
            visitHistory.map((v) => v.doctor).filter((d) => d && d !== "N/A")
          ),
        ].join(", ");
        const allLabWork = [
          ...new Set(visitHistory.map((v) => v.selectedLab).filter(Boolean)),
        ].join(", ");

        const visitSummary = visitHistory
          .map((visit) => {
            // --- THE FIX: Use the safe formatDate helper ---
            const visitDate = formatDate(visit.date);

            if (visit.isDuesPayment) {
              return `${visitDate}: Dues Payment of ₹${(
                visit.paidAmount || 0
              ).toFixed(2)} via ${visit.paymentMode}.`;
            }
            const treatmentsList =
              visit.treatments
                ?.map((t) => `${t.name} (₹${t.price})`)
                .join(", ") || "N/A";
            const medicinesList =
              visit.medicines
                ?.map((m) => `${m.name} (Qty:${m.quantity})`)
                .join(", ") || null;
            let visitString = `${visitDate} (Dr. ${
              visit.doctor || "N/A"
            }): [Treatments: ${treatmentsList}]`;
            if (medicinesList) {
              visitString += ` [Medicines: ${medicinesList}]`;
            }
            visitString += ` - Paid ₹${(visit.paidAmount || 0).toFixed(
              2
            )} via ${visit.paymentMode}`;
            return visitString;
          })
          .join("\n");

        Object.assign(rowData, {
          totalCharges,
          totalTreatmentCharges,
          totalMedicineCharges,
          totalLabCharges,
          totalPaid,
          finalPending,
          visitCount: visitHistory.length,
          // --- THE FIX: Use the safe formatDate helper ---
          firstVisitDate: formatDate(visitHistory[0]?.date),
          lastVisitDate: formatDate(lastVisit?.date),
          allDoctors,
          allLabWork,
          visitSummary,
        });
      } else {
        Object.assign(rowData, {
          totalCharges: 0,
          totalTreatmentCharges: 0,
          totalMedicineCharges: 0,
          totalLabCharges: 0,
          totalPaid: 0,
          finalPending: 0,
          visitCount: 0,
          firstVisitDate: "N/A",
          lastVisitDate: "N/A",
          allDoctors: "N/A",
          allLabWork: "N/A",
          visitSummary: "No visits recorded.",
        });
      }
      const row = worksheet.addRow(rowData);
      const cellsToWrap = [
        "address",
        "additionalInfo",
        "visitSummary",
        "medicalHistory",
        "dentalHistory",
        "dentalChart",
        "oralNotes",
      ];
      cellsToWrap.forEach((cellKey) => {
        if (row.getCell(cellKey)) {
          row.getCell(cellKey).alignment = { wrapText: true, vertical: "top" };
        }
      });
    }
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=patients_summary_report.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Failed to export Excel:", err);
    res.status(500).send("Failed to export Excel");
  }
});

module.exports = router;
