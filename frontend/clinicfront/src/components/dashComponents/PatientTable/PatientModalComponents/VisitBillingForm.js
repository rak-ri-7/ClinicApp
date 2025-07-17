import React, { useContext } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  Grid,
  FormControlLabel,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import MedicineSelection from "../MedicineSelection";
import { ConsultationFeeContext } from "../../../../context/ConsultationFeeContext";
import { XrayFeeContext } from "../../../../context/XrayFeeContext";
import { LabContext } from "../../../../context/LabContext";

const VisitBillingForm = ({
  activeVisit,
  onVisitChange,
  onTreatmentChange,
  onAddTreatment,
  onRemoveTreatment,
  onMedicineSelection,
  onMedicineQuantityChange,
  isSpecialistFeeDisabled,
  medicines,
}) => {
  const { consultationFee } = useContext(ConsultationFeeContext);
  const { xrayFee } = useContext(XrayFeeContext);
  const { labs } = useContext(LabContext);

  if (!activeVisit) return null;

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Checkbox
            checked={activeVisit.isConsultationOnly || false}
            onChange={onVisitChange}
            name="isConsultationOnly"
          />
        }
        label="Only for Consultation"
        disabled={activeVisit.isDuesPayment}
      />
      <fieldset
        disabled={activeVisit.isConsultationOnly || activeVisit.isDuesPayment}
        style={{ border: "none", padding: 0, margin: 0 }}
      >
        <Stack spacing={2}>
          <Box sx={{ border: "1px solid #ccc", borderRadius: "4px", p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Treatments
            </Typography>
            <TextField
              name="treatmentPlan"
              label="Treatment Plan"
              fullWidth
              value={activeVisit.treatmentPlan || ""}
              onChange={onVisitChange}
              sx={{ mb: 2 }}
            />
            {(activeVisit.treatments || []).map((treatment, index) => (
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
                    onChange={(e) => onTreatmentChange(index, e)}
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
                    onChange={(e) => onTreatmentChange(index, e)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => onRemoveTreatment(index)}
                    color="error"
                    disabled={activeVisit.treatments?.length <= 1}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              onClick={onAddTreatment}
              startIcon={<AddCircleOutlineIcon />}
              variant="text"
              size="small"
              sx={{ mt: 1 }}
            >
              Add Treatment
            </Button>
          </Box>
          <TextField
            name="specialistFee"
            label="Specialist Fee"
            fullWidth
            type="number"
            value={
              activeVisit.specialistFee === 0
                ? ""
                : activeVisit.specialistFee || ""
            }
            onChange={onVisitChange}
            disabled={isSpecialistFeeDisabled()}
            helperText={
              isSpecialistFeeDisabled()
                ? "Calculated automatically."
                : "Enter the fixed fee for this case."
            }
          />
        </Stack>
      </fieldset>
      <MedicineSelection
        medicines={medicines}
        selectedMedicines={activeVisit.selectedMedicines || []}
        medicineTotal={activeVisit.medicineCharge || 0}
        handleMedicineSelection={onMedicineSelection}
        handleQuantityChange={onMedicineQuantityChange}
        disabled={activeVisit.isDuesPayment}
      />
      <Divider sx={{ my: 1 }} />
      <Typography variant="h6">Fees & Payment</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControlLabel
          control={
            <Checkbox
              checked={activeVisit.includeConsultationFee || false}
              onChange={onVisitChange}
              name="includeConsultationFee"
            />
          }
          label={`Consult. Fee (₹${consultationFee})`}
          disabled={activeVisit.isDuesPayment}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={activeVisit.includeXrayFee || false}
              onChange={onVisitChange}
              name="includeXrayFee"
            />
          }
          label={`X-Ray Fee (₹${xrayFee})`}
          disabled={activeVisit.isDuesPayment}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Lab Work</InputLabel>
          <Select
            name="selectedLab"
            value={activeVisit.selectedLab || ""}
            label="Lab Work"
            onChange={onVisitChange}
            disabled={
              activeVisit.isConsultationOnly || activeVisit.isDuesPayment
            }
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
          value={activeVisit.labCharge === 0 ? "" : activeVisit.labCharge || ""}
          onChange={onVisitChange}
          disabled={
            !activeVisit.selectedLab ||
            activeVisit.isConsultationOnly ||
            activeVisit.isDuesPayment
          }
        />
      </Stack>
      <Stack spacing={2} direction="row">
        {!activeVisit.isDuesPayment && (
          <TextField
            name="visitCharge"
            label="Charge for This Visit"
            fullWidth
            type="number"
            value={activeVisit.visitCharge?.toFixed(2) || "0.00"}
            disabled
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: "#f0f4c3" }}
          />
        )}
        <TextField
          name="totalCharge"
          label="Cumulative Total Charge"
          fullWidth
          type="number"
          value={activeVisit.totalCharge?.toFixed(2) || "0.00"}
          disabled
          InputProps={{ readOnly: true }}
        />
      </Stack>
      <Stack spacing={2} direction="row">
        <TextField
          name="paidAmount"
          label="Amount Paid (This Visit/Payment)"
          fullWidth
          type="number"
          value={
            activeVisit.paidAmount === 0 ? 0 : activeVisit.paidAmount || ""
          }
          onChange={onVisitChange}
        />
        <FormControl fullWidth>
          <InputLabel>Payment Mode</InputLabel>
          <Select
            name="paymentMode"
            label="Payment Mode"
            value={activeVisit.paymentMode || "Gpay"}
            onChange={onVisitChange}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Gpay">GPay</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack spacing={2} direction="row">
        <TextField
          name="pendingAmountThisVisit"
          label="Pending (This Visit)"
          fullWidth
          value={activeVisit.pendingAmountThisVisit?.toFixed(2) || "0.00"}
          disabled
          InputProps={{
            readOnly: true,
            sx: {
              color:
                (activeVisit.pendingAmountThisVisit || 0) > 0
                  ? "error.main"
                  : "success.main",
              fontWeight: "bold",
            },
          }}
          sx={{ backgroundColor: "#f0f4c3" }}
        />
        <TextField
          name="pendingAmount"
          label="Cumulative Pending"
          fullWidth
          type="number"
          value={
            activeVisit.pendingAmount === 0
              ? 0
              : activeVisit.pendingAmount || ""
          }
          disabled
          InputProps={{ readOnly: true }}
        />
      </Stack>
      <Stack spacing={2} direction="row">
        <TextField
          name="earningsThisVisit"
          label="Earnings (This Visit)"
          fullWidth
          value={activeVisit.earningsThisVisit?.toFixed(2) || "0.00"}
          disabled
          InputProps={{ readOnly: true }}
          sx={{ backgroundColor: "#f0f4c3" }}
        />
        <TextField
          name="totalEarnings"
          label="Cumulative Earnings"
          fullWidth
          type="number"
          value={activeVisit.totalEarnings?.toFixed(2) || "0.00"}
          disabled
          InputProps={{ readOnly: true }}
        />
      </Stack>
    </Stack>
  );
};

export default VisitBillingForm;
