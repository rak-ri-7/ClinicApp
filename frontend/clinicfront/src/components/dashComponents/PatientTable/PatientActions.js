// In a new file like frontend/components/patients/PatientActions.js
import React from "react";
import { Box, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ImportExcel from "../../../utils/ImportExcel";

const PatientActions = ({ onImportSuccess }) => {
  const handleExport = () => {
    // Your existing export logic (window.open or fetch)
    window.open("http://localhost:5000/api/export/excel", "_blank");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleExport}
      >
        Export to Excel
      </Button>
      <ImportExcel onImportSuccess={onImportSuccess} />
    </Box>
  );
};

export default PatientActions;
