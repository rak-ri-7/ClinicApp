import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";

const AddDoctor = ({ open, onClose, formData, onChange, onSubmit, isEdit }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isEdit ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Doctor Name"
          fullWidth
          name="name"
          value={formData.name}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          label="Specialization"
          fullWidth
          name="specialization"
          value={formData.specialization}
          onChange={onChange}
        />

        <FormControl component="fieldset">
          <FormLabel component="legend">Payment Model</FormLabel>
          <RadioGroup
            row
            name="paymentModel"
            value={formData.paymentModel || "Percentage"}
            onChange={onChange}
          >
            <FormControlLabel
              value="Percentage"
              control={<Radio />}
              label="Percentage Cut"
            />
            <FormControlLabel
              value="Fixed"
              control={<Radio />}
              label="Fixed Fee (Per Case)"
            />
          </RadioGroup>
        </FormControl>

        {/* ✨ NEW: Conditionally render the percentage field */}
        {formData.paymentModel === "Percentage" && (
          <TextField
            name="percentageCut"
            label="Percentage Cut (%)"
            type="number"
            value={formData.percentageCut}
            onChange={onChange}
            fullWidth
          />
        )}

        <TextField
          margin="dense"
          label="Experience"
          fullWidth
          name="experience"
          value={formData.experience}
          onChange={onChange}
        />

        <TextField
          margin="dense"
          label="Additional Info"
          fullWidth
          multiline
          rows={3}
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained">
          {isEdit ? "Save Changes" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDoctor;
