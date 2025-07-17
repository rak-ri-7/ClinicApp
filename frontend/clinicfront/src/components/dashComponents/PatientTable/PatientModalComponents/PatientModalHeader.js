import React from "react";
import {
  DialogTitle,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

const PatientModalHeader = ({
  patient,
  profileData,
  managedVisits,
  onStartFollowUp,
  onStartNewVisit,
  onClose,
}) => {
  return (
    <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        {patient ? `Manage Visits for ${patient.name}` : "Add New Patient"}
      </Typography>
      {patient && (
        <Stack direction="row" spacing={1}>
          {profileData.nextAppointment &&
            !managedVisits.some((v) => v.isFollowUp) && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={onStartFollowUp}
              >
                Start Follow-up Visit
              </Button>
            )}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onStartNewVisit}
          >
            Start New Clinical Visit
          </Button>
        </Stack>
      )}
      <IconButton onClick={onClose} sx={{ ml: 2 }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
};

export default PatientModalHeader;
