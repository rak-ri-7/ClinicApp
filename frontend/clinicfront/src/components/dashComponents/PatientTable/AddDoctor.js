import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
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
          label="Percentage Cut"
          type="number"
          fullWidth
          name="percentageCut"
          value={formData.percentageCut ?? 70}
          onChange={onChange}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
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
