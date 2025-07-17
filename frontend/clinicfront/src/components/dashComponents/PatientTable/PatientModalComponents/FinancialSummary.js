import React from "react";
import { Paper, Typography, Grid } from "@mui/material";

const FinancialSummary = ({ financials, patient }) => {
  if (!patient) return null;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: "primary.lightest",
        border: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Typography variant="h6" gutterBottom color="primary.dark">
        Overall Financial Summary
      </Typography>
      <Grid container spacing={2} textAlign="center">
        <Grid item xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">
            Total Charges
          </Typography>
          <Typography variant="h6">
            ₹{financials.totalCharges.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">
            Total Paid
          </Typography>
          <Typography variant="h6" color="success.main">
            ₹{Number(financials.totalPaid || 0).toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">
            Final Pending
          </Typography>
          <Typography
            variant="h6"
            color={financials.pendingAmount > 0 ? "error.main" : "success.main"}
          >
            ₹{financials.pendingAmount.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">
            Clinic Earnings
          </Typography>
          <Typography variant="h6" color="info.main">
            ₹{financials.totalEarnings.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FinancialSummary;
