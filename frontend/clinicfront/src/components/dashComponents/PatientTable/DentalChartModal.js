import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import DentalChart from "./DentalChart"; // The UI component you already have
import api from "../../../api";

// This is the new self-contained modal component
const DentalChartModal = ({ patient, open, onClose, onUpdated }) => {
  const [selectedTeeth, setSelectedTeeth] = useState({});
  const [chartComment, setChartComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // This effect runs when the modal is opened. It cleans the data.
  useEffect(() => {
    if (open && patient) {
      const dentalChartData = patient.dentalChart || {};
      const oralNotesData = patient.oralNotes || "";
      const cleanedChart = {};

      // Robustly clean the chart data, preventing the original crash
      for (const tooth in dentalChartData) {
        if (Object.prototype.hasOwnProperty.call(dentalChartData, tooth)) {
          const observations = dentalChartData[tooth];
          if (Array.isArray(observations)) {
            cleanedChart[tooth] = observations;
          } else if (typeof observations === "string" && observations) {
            cleanedChart[tooth] = [observations];
          } else {
            cleanedChart[tooth] = [];
          }
        }
      }
      setSelectedTeeth(cleanedChart);
      setChartComment(oralNotesData);
    }
  }, [open, patient]);

  const handleSave = async () => {
    if (!patient) return;
    setIsLoading(true);
    try {
      // Create the payload to send to the backend
      const updatedData = {
        dentalChart: selectedTeeth,
        oralNotes: chartComment,
      };

      // Use the existing PUT endpoint to update just these fields
      await api.put(`/api/patients/${patient._id}`, updatedData);

      onUpdated(); // This will trigger fetchPatients in the parent
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving dental chart:", error);
      alert("Failed to save dental chart.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        style={{ textAlign: "center", marginBottom: "10px", marginTop: "10px" }}
      >
        Oral Examination for {patient?.name}
      </DialogTitle>
      <DialogContent>
        {/* The DentalChart UI component is now just a child */}
        <DentalChart
          selectedTeeth={selectedTeeth}
          setSelectedTeeth={setSelectedTeeth}
          chartComment={chartComment}
          setChartComment={setChartComment}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Save Chart"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DentalChartModal;
