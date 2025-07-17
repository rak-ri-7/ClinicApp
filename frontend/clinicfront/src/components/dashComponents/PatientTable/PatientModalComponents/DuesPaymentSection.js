import React from "react";
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

const DuesPaymentSection = ({
  patient,
  duesPaid,
  onDuesPaidChange,
  duesPaymentMode,
  onDuesPaymentModeChange,
  duesPaidDate,
  onDuesPaidDateChange,
  onStageDuesPayment,
}) => {
  if (!patient) return null;

  return (
    <>
      <Divider sx={{ my: 3 }}>
        <Chip label="RECORD PAYMENT FOR PAST DUES" />
      </Divider>
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use this section ONLY to record a payment for a previous outstanding
          balance.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="Amount of Dues Paid"
            type="number"
            fullWidth
            value={duesPaid}
            onChange={onDuesPaidChange}
          />
          <FormControl fullWidth>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={duesPaymentMode}
              label="Payment Mode"
              onChange={onDuesPaymentModeChange}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Gpay">GPay</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Date of Payment"
            value={duesPaidDate}
            onChange={onDuesPaidDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={onStageDuesPayment}
            sx={{ flexShrink: 0 }}
            disabled={!duesPaid || Number(duesPaid) <= 0}
          >
            Stage Dues Payment
          </Button>
        </Stack>
      </Paper>
    </>
  );
};

export default DuesPaymentSection;
