const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const PatientSchema = require("../models/patientModel");

// 📤 Export to Excel (One Row Per Patient Summary)
router.get("/export/excel", async (req, res) => {
  try {
    const patients = await PatientSchema.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Patients Summary");

    // --- Updated column definitions to include all requested fields ---
    worksheet.columns = [
      // Patient Profile
      { header: "Name", key: "name", width: 25 },
      { header: "Age", key: "age", width: 8 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Additional Info", key: "additionalInfo", width: 40 },

      // Overall Financial Summary
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

      // Summarized Visit Information
      { header: "Number of Visits", key: "visitCount", width: 15 },
      { header: "First Visit Date", key: "firstVisitDate", width: 15 },
      { header: "Last Visit Date", key: "lastVisitDate", width: 15 },
      { header: "Next Appointment", key: "nextAppointment", width: 20 },
      { header: "All Doctors Seen", key: "allDoctors", width: 30 },
      { header: "All Lab Work Done", key: "allLabWork", width: 30 },

      // Detailed Chronological Summaries (in single cells)
      {
        header: "Visit & Payment History (Chronological)",
        key: "visitSummary",
        width: 80,
      },

      // Histories & Notes
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
        // Basic Profile
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        address: patient.address,
        additionalInfo: patient.additionalInfo,
        medicalHistory: patient.medicalHistory,
        dentalHistory: patient.dentalHistory,
        oralNotes: patient.oralNotes,
        nextAppointment: patient.nextAppointment
          ? new Date(patient.nextAppointment).toLocaleDateString()
          : "N/A",
        totalEarnings: patient.totalEarnings || 0,
        dentalChart: "N/A",
      };

      // Format the Dental Chart / Oral Examination data
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

        // --- Calculate Overall Financials ---
        const totalCharges = lastVisit.totalCharge || 0;
        const totalPaid = visitHistory.reduce(
          (sum, v) => sum + (v.paidAmount || 0),
          0
        );
        const finalPending = totalCharges - totalPaid;

        // --- Aggregate specific charges from all visits ---
        const totalTreatmentCharges = visitHistory.reduce((sum, v) => {
          const visitTreatmentTotal =
            v.treatments?.reduce((vSum, t) => vSum + (t.price || 0), 0) || 0;
          return sum + visitTreatmentTotal;
        }, 0);

        const totalMedicineCharges = visitHistory.reduce((sum, v) => {
          const visitMedicineTotal =
            v.medicines?.reduce(
              (vSum, m) => vSum + (m.pricePerUnit || 0) * (m.quantity || 0),
              0
            ) || 0;
          return sum + visitMedicineTotal;
        }, 0);

        const totalLabCharges = visitHistory.reduce(
          (sum, v) => sum + (v.labCharge || 0),
          0
        );

        // --- Summarize Visit Data ---
        const allDoctors = [
          ...new Set(
            visitHistory.map((v) => v.doctor).filter((d) => d && d !== "N/A")
          ),
        ].join(", ");
        const allLabWork = [
          ...new Set(visitHistory.map((v) => v.selectedLab).filter(Boolean)),
        ].join(", ");

        // --- Create a detailed chronological summary string for the 'Visit History' cell ---
        const visitSummary = visitHistory
          .map((visit) => {
            const visitDate = new Date(visit.date).toLocaleDateString();
            if (visit.isDuesPayment) {
              return `${visitDate}: Dues Payment of ₹${visit.paidAmount.toFixed(
                2
              )} via ${visit.paymentMode}.`;
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
            visitString += ` - Paid ₹${visit.paidAmount.toFixed(2)} via ${
              visit.paymentMode
            }`;
            return visitString;
          })
          .join("\n"); // Use newline to separate entries within the cell

        Object.assign(rowData, {
          totalCharges,
          totalTreatmentCharges,
          totalMedicineCharges,
          totalLabCharges,
          totalPaid,
          finalPending,
          visitCount: visitHistory.length,
          firstVisitDate: new Date(visitHistory[0].date).toLocaleDateString(),
          lastVisitDate: new Date(lastVisit.date).toLocaleDateString(),
          allDoctors,
          allLabWork,
          visitSummary,
        });
      } else {
        // Patient has no visit history, fill with defaults
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

      // --- IMPORTANT: Enable text wrapping for all multi-line summary cells ---
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
        row.getCell(cellKey).alignment = { wrapText: true, vertical: "top" };
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
