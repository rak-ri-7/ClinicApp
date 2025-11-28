// src/components/Patients/PatientModal/VisitBillForm.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import dayjs from "dayjs";

const VisitBillForm = ({ open, onClose, visitData, patientProfile }) => {
  if (!visitData || !patientProfile) {
    return null; // Or render a loading/error state
  }

  const {
    date,
    doctor,
    chiefComplaint,
    treatments,
    selectedMedicines,
    medicineCharge,
    labCharge,
    specialistFee,
    visitCharge,
    totalCharge,
    paidAmount,
    paymentMode,
    pendingAmount,
    includeConsultationFee,
    includeXrayFee,
    isFollowUp,
  } = visitData;

  const { name: patientName, phoneNumber, address } = patientProfile;

  const totalTreatmentPrice = treatments.reduce(
    (acc, t) => acc + Number(t.price || 0),
    0
  );
  const totalMedicinePrice = selectedMedicines.reduce(
    (acc, m) => acc + Number(m.pricePerUnit || 0) * Number(m.quantity || 0),
    0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white" }}>
        Bill for Visit on {dayjs(date).format("DD MMMM YYYY")}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom align="center">
            {patientName}'s Visit Bill
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center">
            Dental Clinic
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Patient Name:</strong> {patientName}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {phoneNumber}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {address}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: "right" }}>
              <Typography variant="body1">
                <strong>Bill Date:</strong>{" "}
                {dayjs().format("DD MMMM YYYY hh:mm A")}
              </Typography>
              <Typography variant="body1">
                <strong>Visit Date:</strong>{" "}
                {dayjs(date).format("DD MMMM YYYY")}
              </Typography>
              <Typography variant="body1">
                <strong>Doctor:</strong> {doctor || "N/A"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Chief Complaint:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {chiefComplaint || "N/A"}
          </Typography>

          {/* Treatments Section */}
          {treatments?.length > 0 && totalTreatmentPrice > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Treatments
              </Typography>
              <Table size="small" sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {treatments.map((t, index) =>
                    t.name?.trim() && Number(t.price) > 0 ? (
                      <TableRow key={index}>
                        <TableCell>{t.name}</TableCell>
                        <TableCell align="right">
                          {Number(t.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ) : null
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Total Treatments
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {totalTreatmentPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}

          {/* Medicines Section */}
          {selectedMedicines?.length > 0 && totalMedicinePrice > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Medicines
              </Typography>
              <Table size="small" sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine Name</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price/Unit (₹)</TableCell>
                    <TableCell align="right">Total (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedMedicines.map((med, index) =>
                    med.name?.trim() && Number(med.quantity) > 0 ? (
                      <TableRow key={index}>
                        <TableCell>{med.name}</TableCell>
                        <TableCell align="right">{med.quantity}</TableCell>
                        <TableCell align="right">
                          {Number(med.pricePerUnit).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {(
                            Number(med.pricePerUnit) * Number(med.quantity)
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ) : null
                  )}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                      Total Medicines
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {totalMedicinePrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}

          {/* Other Charges */}
          <Typography variant="h6" gutterBottom>
            Other Charges
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableBody>
              {includeConsultationFee && (
                <TableRow>
                  <TableCell>Consultation Fee</TableCell>
                  <TableCell align="right">
                    {(
                      visitCharge -
                      totalTreatmentPrice -
                      totalMedicinePrice -
                      labCharge -
                      specialistFee
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
              {includeXrayFee && (
                <TableRow>
                  <TableCell>X-Ray Fee</TableCell>
                  <TableCell align="right">
                    X-Ray Price (Add logic for actual Xray fee if different from
                    consultation)
                  </TableCell>
                </TableRow>
              )}
              {labCharge > 0 && (
                <TableRow>
                  <TableCell>Lab Charges</TableCell>
                  <TableCell align="right">{labCharge.toFixed(2)}</TableCell>
                </TableRow>
              )}
              {specialistFee > 0 && (
                <TableRow>
                  <TableCell>Specialist Fee</TableCell>
                  <TableCell align="right">
                    {specialistFee.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Net Visit Charge
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {visitCharge.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Divider sx={{ my: 3 }} />

          {/* Summary */}
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} sm={6}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Total Bill Amount
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ₹{totalCharge.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Amount Paid</TableCell>
                    <TableCell align="right">
                      ₹{paidAmount.toFixed(2)} ({paymentMode})
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "red" }}>
                      Pending Amount
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", color: "red" }}
                    >
                      ₹{pendingAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Thank you for your visit!
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        {/* You can add a print button here later */}
        <Button
          onClick={() => {
            // Logic to print the bill (e.g., open in new window for printing)
            const printWindow = window.open("", "_blank");
            const content = document.querySelector(
              ".MuiDialogContent-root"
            ).innerHTML; // Select content to print
            printWindow.document.write(`
              <html>
                <head>
                  <title>Dental Bill</title>
                  <style>
                    body { font-family: 'Roboto', sans-serif; margin: 20px; }
                    .MuiTypography-root { margin-bottom: 8px; }
                    .MuiTable-root { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                    .MuiTableCell-root { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    .MuiTableCell-root.MuiTableCell-alignRight { text-align: right; }
                    .MuiTableCell-root.MuiTableCell-body { font-size: 0.875rem; }
                    .MuiTableCell-root.MuiTableCell-head { font-weight: bold; background-color: #f5f5f5; }
                    .MuiTableRow-root.MuiTableRow-head { border-bottom: 2px solid #ccc; }
                    .MuiDivider-root { margin: 16px 0; border-top: 1px dashed #ccc; }
                    .MuiBox-root { margin-top: 24px; text-align: center; }
                    h5 { text-align: center; color: #1976d2; }
                    h6 { color: #3f51b5; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 15px; }
                    strong { font-weight: bold; }
                    .print-header, .print-footer { text-align: center; margin-bottom: 20px; }
                    @media print {
                        button { display: none; }
                        a { text-decoration: none; color: black; }
                        /* Ensure no dialog actions or other UI elements are printed */
                        .MuiDialogActions-root, .MuiDialogTitle-root { display: none; }
                        /* Make content full width */
                        .MuiDialog-root, .MuiPaper-root, .MuiDialogContent-root {
                            width: auto !important;
                            max-width: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                    }
                  </style>
                </head>
                <body>
                    <div class="print-header">
                        <Typography variant="h5">Dental Clinic Bill</Typography>
                        <Typography variant="subtitle1">Generated on: ${dayjs().format(
                          "DD MMMM YYYY hh:mm A"
                        )}</Typography>
                    </div>
                    ${content}
                    <div class="print-footer">
                        <Typography variant="body2" color="textSecondary">
                            This is a computer-generated bill and does not require a signature.
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Contact us at [Your Clinic Phone Number]
                        </Typography>
                    </div>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }}
          color="secondary"
          variant="outlined"
        >
          Print Bill
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitBillForm;
