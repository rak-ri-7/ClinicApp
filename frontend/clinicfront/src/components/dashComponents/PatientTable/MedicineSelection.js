// src/components/MedicineSelection.js
import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  TextField,
} from "@mui/material";

const MedicineSelection = ({
  medicines,
  selectedMedicines,
  medicineTotal,
  handleMedicineSelection,
  handleQuantityChange,
}) => {
  return (
    <>
      <FormControl fullWidth margin="normal">
        <InputLabel>Medicines</InputLabel>
        <Select
          multiple
          value={selectedMedicines.map((m) => m.name)}
          onChange={(e) => handleMedicineSelection(e.target.value)}
          renderValue={(selected) => selected.join(", ")}
        >
          {medicines.map((medicine) => (
            <MenuItem
              key={medicine._id}
              value={medicine.name}
              disabled={medicine.quantity === 0}
            >
              {medicine.name} - ₹{medicine.pricePerUnit?.toFixed(2) || "0.00"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedMedicines.map((med) => {
        const medicine = medicines.find((m) => m.name === med.name);
        const available = medicine ? medicine.quantity : 0;

        return (
          <Box
            key={med.name}
            sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}
          >
            <Typography sx={{ width: "30%" }}>{med.name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                label="Quantity"
                type="number"
                value={med.quantity}
                onChange={(e) => handleQuantityChange(med.name, e.target.value)}
                inputProps={{
                  min: 1,
                  max: available + med.quantity, // Allow reducing even if over available
                }}
                sx={{ width: "100px" }}
              />
              <Typography variant="caption" color="textSecondary">
                Available: {available}
              </Typography>
            </Box>
            <Typography sx={{ width: "30%", textAlign: "right" }}>
              ₹{(med.quantity * (Number(med.pricePerUnit) || 0)).toFixed(2)}
            </Typography>
          </Box>
        );
      })}
      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Typography variant="subtitle1">
          Medicine Total: ₹{medicineTotal.toFixed(2)}
        </Typography>
      </Box>
    </>
  );
};

export default MedicineSelection;
