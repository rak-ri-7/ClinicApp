import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import MedicineSelection from "./MedicineSelection";

// This component contains all the UI for a SINGLE visit.
// It receives the specific visit's data and handlers as props.
const VisitForm = ({
  visit,
  visitIndex,
  onFormChange,
  onTreatmentChange,
  onAddTreatment,
  onRemoveTreatment,
  onMedicineSelection,
  onMedicineQuantityChange,
  doctors,
  labs,
  medicines,
  consultationFee,
  xrayFee,
  specialistFee,
}) => {
  // Helper to pass the visitIndex back to the parent
  const handleChange = (e) => {
    onFormChange(visitIndex, e);
  };

  return (
    <Grid container spacing={4}>
      {/* LEFT COLUMN - VISIT & CLINICAL DETAILS */}
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <Typography variant="h6" gutterBottom>
            Visit Details
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              name="date"
              label="Date of Appointment"
              fullWidth
              type="date"
              value={visit.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                name="doctor"
                value={visit.doctor}
                onChange={handleChange}
                label="Doctor"
              >
                {doctors.map((d) => (
                  <MenuItem key={d._id} value={d.name}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            name="chiefComplaint"
            label="Chief Complaint"
            fullWidth
            multiline
            rows={3}
            value={visit.chiefComplaint}
            onChange={handleChange}
          />
        </Stack>
      </Grid>

      {/* RIGHT COLUMN - TREATMENTS & FINANCIALS */}
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <Typography variant="h6" gutterBottom>
            Clinical & Financial Details
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={visit.isConsultationOnly}
                onChange={handleChange}
                name="isConsultationOnly"
              />
            }
            label="Only for Consultation"
          />
          <fieldset
            disabled={visit.isConsultationOnly}
            style={{ border: "none", padding: 0, margin: 0 }}
          >
            <Box sx={{ border: "1px solid #ccc", borderRadius: "4px", p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Treatments
              </Typography>
              <TextField
                name="treatmentPlan"
                label="Treatment Plan"
                fullWidth
                value={visit.treatmentPlan}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              {visit.treatments.map((treatment, index) => (
                <Grid
                  container
                  spacing={1}
                  key={index}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Grid item xs={6}>
                    <TextField
                      name="name"
                      label={`Treatment ${index + 1}`}
                      fullWidth
                      value={treatment.name}
                      onChange={(e) => onTreatmentChange(visitIndex, index, e)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="price"
                      label="Price"
                      fullWidth
                      type="number"
                      value={treatment.price}
                      onChange={(e) => onTreatmentChange(visitIndex, index, e)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => onRemoveTreatment(visitIndex, index)}
                      color="error"
                      disabled={visit.treatments.length === 1}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                onClick={() => onAddTreatment(visitIndex)}
                startIcon={<AddCircleOutlineIcon />}
                variant="text"
                size="small"
                sx={{ mt: 1 }}
              >
                Add Treatment
              </Button>
            </Box>
          </fieldset>

          <MedicineSelection
            medicines={medicines}
            selectedMedicines={visit.selectedMedicines}
            medicineTotal={visit.medicineCharge}
            handleMedicineSelection={(selectedNames) =>
              onMedicineSelection(visitIndex, selectedNames)
            }
            handleQuantityChange={(name, quantity) =>
              onMedicineQuantityChange(visitIndex, name, quantity)
            }
          />

          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Fees & Charges (For This Visit)
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={visit.includeConsultationFee}
                  onChange={handleChange}
                  name="includeConsultationFee"
                />
              }
              label={`Consult. Fee (₹${consultationFee})`}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={visit.includeXrayFee}
                  onChange={handleChange}
                  name="includeXrayFee"
                  disabled={visit.isConsultationOnly}
                />
              }
              label={`X-Ray Fee (₹${xrayFee})`}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Lab</InputLabel>
              <Select
                name="selectedLab"
                value={visit.selectedLab}
                onChange={handleChange}
                label="Lab"
                disabled={visit.isConsultationOnly}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {labs.map((lab) => (
                  <MenuItem key={lab._id} value={lab.name}>
                    {lab.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="labCharge"
              label="Lab Charges"
              fullWidth
              type="number"
              value={visit.labCharge}
              onChange={handleChange}
              margin="normal"
              disabled={!visit.selectedLab || visit.isConsultationOnly}
            />
          </Stack>
          <TextField
            name="specialistFee"
            label="Specialist Fee"
            fullWidth
            type="number"
            value={specialistFee.toFixed(2)}
            disabled
            InputProps={{ readOnly: true }}
          />
          <TextField
            name="totalCharge"
            label="Total Charge (This Visit)"
            fullWidth
            type="number"
            value={visit.totalCharge.toFixed(2)}
            disabled
            InputProps={{ readOnly: true }}
          />

          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Payment (For This Visit)
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              name="paidAmount"
              label="Amount Paid"
              fullWidth
              type="number"
              value={visit.paidAmount}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                name="paymentMode"
                label="Payment Mode"
                value={visit.paymentMode}
                onChange={handleChange}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Gpay">GPay</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            name="pendingAmount"
            label="Pending Amount (This Visit)"
            fullWidth
            type="number"
            value={visit.pendingAmount.toFixed(2)}
            disabled
            InputProps={{ readOnly: true }}
          />
          <TextField
            name="totalEarnings"
            label="Earnings (This Visit)"
            fullWidth
            type="number"
            value={visit.totalEarnings.toFixed(2)}
            disabled
            InputProps={{ readOnly: true }}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default VisitForm;
