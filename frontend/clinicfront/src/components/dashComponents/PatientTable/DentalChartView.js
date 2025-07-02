import React from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  TextField,
  Tooltip,
} from "@mui/material";

// Layout remains the same
const layout = [
  [11, 12, 13, 14, 15, 16, 17, 18],
  [21, 22, 23, 24, 25, 26, 27, 28],
  [31, 32, 33, 34, 35, 36, 37, 38],
  [41, 42, 43, 44, 45, 46, 47, 48],
];

// Helper function to ensure data is always an array
const getObservationsArray = (observations) => {
  if (Array.isArray(observations)) return observations;
  if (typeof observations === "string" && observations) return [observations];
  return [];
};

// The new View-Only Component
const DentalChartView = ({ dentalChart = {}, oralNotes = "" }) => {
  return (
    <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: "8px" }}>
      <Typography variant="h6" gutterBottom align="center">
        Oral Examination Summary
      </Typography>

      <Grid container spacing={2} direction="column" alignItems="center">
        {layout.map((row, i) => (
          <Grid item key={i}>
            <Grid container spacing={1} justifyContent="center">
              {row.map((tooth) => {
                const observations = getObservationsArray(dentalChart[tooth]);
                const hasObservation = observations.length > 0;

                // Render a placeholder if no observation, to keep the structure
                if (!hasObservation) {
                  return (
                    <Grid item key={tooth}>
                      <Paper
                        variant="outlined"
                        sx={{
                          width: 50,
                          height: 60,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#f5f5f5",
                          color: "#aaa",
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          fontWeight="bold"
                        >
                          {tooth}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                }

                // Render the box with details if there is an observation
                return (
                  <Grid item key={tooth}>
                    <Tooltip
                      title={
                        observations.length > 0
                          ? `${tooth}: ${observations.join(", ")}` // Now this is safe
                          : "No observation added"
                      }
                      arrow
                    >
                      <Paper
                        elevation={3}
                        sx={{
                          width: 50,
                          height: 65,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#e3f2fd",
                          border: "2px solid #1976d2",
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
                        <Typography
                          variant="caption"
                          color="primary"
                          align="center"
                          sx={{
                            padding: "0 4px",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                        >
                          {observations.join(", ")}
                        </Typography>
                      </Paper>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        ))}
      </Grid>

      {oralNotes && (
        <TextField
          label="Oral Examination Notes"
          multiline
          fullWidth
          margin="normal"
          value={oralNotes}
          InputProps={{
            readOnly: true, // Make the text field read-only
          }}
          variant="outlined" // Use outlined to look consistent
        />
      )}
    </Box>
  );
};

export default DentalChartView;
