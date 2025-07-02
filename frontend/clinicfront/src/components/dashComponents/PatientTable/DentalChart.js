import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Typography,
  Paper,
  Grid,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";

const layout = [
  [11, 12, 13, 14, 15, 16, 17, 18],
  [21, 22, 23, 24, 25, 26, 27, 28],
  [31, 32, 33, 34, 35, 36, 37, 38],
  [41, 42, 43, 44, 45, 46, 47, 48],
];

const options = [
  "Decay",
  "Missing",
  "Restoration",
  "Chronic Irreversible Pulpitis",
  "Impacted",
  "Fractured",
];

const getObservationsArray = (observations) => {
  if (Array.isArray(observations)) return observations;
  if (typeof observations === "string" && observations) return [observations];
  return []; // Default to an empty array
};

const DentalChart = ({
  selectedTeeth,
  setSelectedTeeth,
  chartComment,
  setChartComment,
}) => {
  const [openToothDialog, setOpenToothDialog] = useState(null);
  const [currentObservations, setCurrentObservations] = useState([]);

  const handleToothClick = (tooth) => {
    // Use the safe helper here too!
    setCurrentObservations(getObservationsArray(selectedTeeth[tooth]));
    setOpenToothDialog(tooth);
  };

  const saveObservation = () => {
    setSelectedTeeth((prev) => ({
      ...prev,
      [openToothDialog]: currentObservations,
    }));
    setOpenToothDialog(null);
  };

  const removeObservation = () => {
    const updated = { ...selectedTeeth };
    delete updated[openToothDialog];
    setSelectedTeeth(updated);
    setOpenToothDialog(null);
  };

  return (
    <div>
      <Grid container spacing={2} direction="column" alignItems="center">
        {layout.map((row, i) => (
          <Grid item key={i}>
            <Grid container spacing={1.5} justifyContent="center">
              {row.map((tooth) => {
                const observations = getObservationsArray(selectedTeeth[tooth]);
                const hasObservation = observations.length > 0;

                return (
                  <Grid item key={tooth}>
                    <Tooltip
                      title={
                        observations.length > 0
                          ? `${tooth}: ${observations.join(", ")}` // Now this is safe
                          : "Click to add observation"
                      }
                      arrow
                    >
                      <Paper
                        elevation={observations.length > 0 ? 6 : 2}
                        onClick={() => handleToothClick(tooth)}
                        sx={{
                          // ... sx styles
                          width: 65, // Increased width
                          height: 75, // Increased height
                          cursor: "pointer", // Make cursor a pointer on hover
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          transition:
                            "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out", // Smooth transition
                          "&:hover": {
                            transform: "scale(1.05)", // Slightly enlarge on hover
                            boxShadow: 8, // Increase shadow on hover
                          },
                          // --- END UI IMPROVEMENTS ---

                          // Conditional styling
                          backgroundColor: hasObservation
                            ? "#e3f2fd"
                            : "#ffffff",
                          border: hasObservation
                            ? "2px solid #1976d2"
                            : "1px solid #ccc",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          fontWeight="bold"
                        >
                          {tooth}
                        </Typography>
                        {hasObservation && (
                          <Typography
                            variant="caption"
                            color="primary"
                            align="center"
                            sx={{
                              padding: "0 4px", // Add some padding
                              fontWeight: "500",
                              // Truncate text if too long
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            }}
                          >
                            {observations.join(", ")}
                          </Typography>
                        )}
                      </Paper>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        ))}
      </Grid>

      <TextField
        label="Oral Examination Notes"
        multiline
        minRows={3}
        fullWidth
        margin="normal"
        value={chartComment}
        onChange={(e) => setChartComment(e.target.value)}
        placeholder="Enter notes or findings related to selected teeth..."
      />

      <Dialog open={!!openToothDialog} onClose={() => setOpenToothDialog(null)}>
        <DialogTitle>Tooth {openToothDialog} Observations</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="observation-label">Observation</InputLabel>
            <Select
              labelId="observation-label"
              multiple
              value={currentObservations}
              onChange={(e) => setCurrentObservations(e.target.value)}
              renderValue={(selected) => selected.join(", ")}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  <Checkbox checked={currentObservations.includes(opt)} />
                  <ListItemText primary={opt} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={removeObservation} color="error">
            Remove
          </Button>
          <Button onClick={() => setOpenToothDialog(null)}>Cancel</Button>
          <Button onClick={saveObservation} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DentalChart;
