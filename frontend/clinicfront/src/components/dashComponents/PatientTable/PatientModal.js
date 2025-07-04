import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  Grid,
  FormControlLabel,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Stack,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import api from "../../../api";
import dayjs from "dayjs";
import { MedicinesContext } from "../../../context/MedicinesContext";
import { ConsultationFeeContext } from "../../../context/ConsultationFeeContext";
import { XrayFeeContext } from "../../../context/XrayFeeContext";
import { LabContext } from "../../../context/LabContext";
import { DoctorsContext } from "../../../context/DoctorsContext";
import { useNotification } from "../../../context/NotificationContext";
import MedicineSelection from "./MedicineSelection";

const getInitialVisitData = () => ({
  _id: `new_${Date.now()}`,
  date: dayjs().format("YYYY-MM-DD"),
  doctor: "",
  chiefComplaint: "",
  treatmentPlan: "",
  treatments: [{ name: "", price: "" }],
  selectedMedicines: [],
  medicineCharge: 0,
  selectedLab: "",
  labCharge: 0,
  specialistFee: 0,
  visitCharge: 0,
  totalCharge: 0,
  paidAmount: 0,
  paymentMode: "Gpay",
  pendingAmount: 0,
  totalEarnings: 0,
  isConsultationOnly: false,
  includeConsultationFee: false,
  includeXrayFee: false,
});

const PatientModal = ({ patient, open, onClose, onUpdated }) => {
  const { medicines, getMedicinePrice } = useContext(MedicinesContext);
  const { consultationFee } = useContext(ConsultationFeeContext);
  const { xrayFee } = useContext(XrayFeeContext);
  const { labs } = useContext(LabContext);
  const { doctors } = useContext(DoctorsContext);
  const { showNotification } = useNotification();

  const [managedVisits, setManagedVisits] = useState([]);
  const [activeVisitIndex, setActiveVisitIndex] = useState(0);
  const [profileData, setProfileData] = useState({});
  const [duesPaid, setDuesPaid] = useState("");
  const [duesPaidDate, setDuesPaidDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [duesPaymentMode, setDuesPaymentMode] = useState("Cash");
  const [initialState, setInitialState] = useState(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [cumulativeFinancials, setCumulativeFinancials] = useState({
    totalCharges: 0,
    totalPaid: 0,
    pendingAmount: 0,
    totalEarnings: 0,
  });

  // --- START OF THE FIX ---

  // 1. Create a dedicated calculation function. This makes the logic reusable.
  const calculateVisitCharges = useCallback(
    (visits) => {
      let cumulativeCharge = 0;
      let cumulativePaid = 0;
      let cumulativeEarnings = 0;

      return visits.map((visit) => {
        if (visit.isDuesPayment) {
          const duesPaidAmount = Number(visit.paidAmount) || 0;
          cumulativePaid += duesPaidAmount;
          cumulativeEarnings += duesPaidAmount;

          return {
            ...visit,
            visitCharge: 0,
            totalCharge: cumulativeCharge,
            pendingAmount: cumulativeCharge - cumulativePaid,
            totalEarnings: cumulativeEarnings,
          };
        } else {
          const treatmentCharge =
            (visit.treatments || []).reduce(
              (sum, t) => sum + (Number(t.price) || 0),
              0
            ) || 0;
          const medicineCharge =
            (visit.selectedMedicines || visit.medicines || []).reduce(
              (sum, m) => sum + (m.pricePerUnit || 0) * (m.quantity || 0),
              0
            ) || 0;
          const consultationFeeAmount = visit.includeConsultationFee
            ? Number(consultationFee)
            : 0;
          const xrayFeeAmount = visit.includeXrayFee ? Number(xrayFee) : 0;
          const labCharge = Number(visit.labCharge) || 0;

          const incrementalChargeForThisVisit =
            treatmentCharge +
            medicineCharge +
            labCharge +
            consultationFeeAmount +
            xrayFeeAmount;

          const selectedDoctor = doctors.find(
            (doc) => doc.name === visit.doctor
          );
          const specialistFee =
            selectedDoctor && selectedDoctor.name !== "Swathi Lakshmi"
              ? ((selectedDoctor.percentageCut || 0) / 100) * treatmentCharge
              : 0;

          const paidForThisVisit = Number(visit.paidAmount) || 0;
          cumulativeCharge += incrementalChargeForThisVisit;
          cumulativePaid += paidForThisVisit;
          const incrementalEarnings =
            paidForThisVisit - specialistFee - labCharge;
          cumulativeEarnings += incrementalEarnings;

          return {
            ...visit,
            visitCharge: incrementalChargeForThisVisit, // The important field
            totalCharge: cumulativeCharge,
            pendingAmount: cumulativeCharge - cumulativePaid,
            totalEarnings: cumulativeEarnings,
            specialistFee,
          };
        }
      });
    },
    [consultationFee, xrayFee, doctors]
  );

  useEffect(() => {
    if (open) {
      setDuesPaid("");
      setDuesPaidDate(dayjs().format("YYYY-MM-DD"));
      setDuesPaymentMode("Cash");

      if (patient) {
        // Prepare a deep copy for snapshotting
        const snapshotVisits =
          patient.visitHistory?.length > 0
            ? JSON.parse(JSON.stringify(patient.visitHistory))
            : [getInitialVisitData()];
        const snapshot = {
          profile: {
            name: patient.name || "",
            age: patient.age || "",
            gender: patient.gender || "",
            phoneNumber: patient.phoneNumber || "",
            address: patient.address || "",
            additionalInfo: patient.additionalInfo || "",
            medicalHistory: patient.medicalHistory || "",
            dentalHistory: patient.dentalHistory || "",
            nextAppointment: patient.nextAppointment?.split("T")[0] || "",
          },
          visits: snapshotVisits,
        };
        setInitialState(snapshot);

        setProfileData({ ...snapshot.profile });

        // 2. Prepare the initial visits from the patient prop
        const initialVisits = (
          patient.visitHistory?.length > 0
            ? patient.visitHistory
            : [getInitialVisitData()]
        ).map((v) => ({
          ...v,
          date: dayjs(v.date).format("YYYY-MM-DD"),
          treatments:
            v.treatments?.length > 0 ? v.treatments : [{ name: "", price: "" }],
          selectedMedicines: v.medicines || [],
        }));

        // 3. Immediately run the calculation on these initial visits
        const calculatedVisits = calculateVisitCharges(initialVisits);
        setManagedVisits(calculatedVisits);
        setActiveVisitIndex(calculatedVisits.length - 1);
      } else {
        const newPatientProfile = {
          name: "",
          age: "",
          gender: "",
          phoneNumber: "",
          address: "",
          additionalInfo: "",
          medicalHistory: "",
          dentalHistory: "",
          nextAppointment: "",
        };
        const newPatientVisits = [getInitialVisitData()];
        const snapshot = {
          profile: newPatientProfile,
          visits: newPatientVisits,
        };
        setInitialState(JSON.parse(JSON.stringify(snapshot)));
        setProfileData(newPatientProfile);
        setManagedVisits(newPatientVisits);
        setActiveVisitIndex(0);
      }
    }
  }, [patient, open, calculateVisitCharges]);

  useEffect(() => {
    if (!open) return;

    // 4. This second useEffect now just re-calculates when things change *during* an edit session
    const recalculatedVisits = calculateVisitCharges(managedVisits);

    // Only update state if there's an actual change to prevent infinite loops
    if (JSON.stringify(recalculatedVisits) !== JSON.stringify(managedVisits)) {
      setManagedVisits(recalculatedVisits);
    }
  }, [managedVisits, open, calculateVisitCharges]);

  // --- END OF THE FIX ---

  useEffect(() => {
    if (!open || !patient) {
      setCumulativeFinancials({
        totalCharges: 0,
        totalPaid: 0,
        pendingAmount: 0,
        totalEarnings: 0,
      });
      return;
    }

    const lastVisit = managedVisits[managedVisits.length - 1];
    if (lastVisit) {
      setCumulativeFinancials({
        totalCharges: lastVisit.totalCharge || 0,
        totalPaid:
          (lastVisit.totalCharge || 0) - (lastVisit.pendingAmount || 0),
        pendingAmount: lastVisit.pendingAmount || 0,
        totalEarnings: lastVisit.totalEarnings || 0,
      });
    } else {
      setCumulativeFinancials({
        totalCharges: 0,
        totalPaid: 0,
        pendingAmount: 0,
        totalEarnings: 0,
      });
    }
  }, [managedVisits, patient, open]);

  const isFormDirty = () => {
    if (!initialState) {
      return false;
    }
    const currentState = {
      profile: profileData,
      visits: managedVisits,
    };
    return JSON.stringify(initialState) !== JSON.stringify(currentState);
  };

  const handleAttemptClose = () => {
    if (isFormDirty()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = (confirmed) => {
    setShowConfirmClose(false);
    if (confirmed) {
      onClose();
    }
  };

  const handleStartNewVisit = () => {
    setManagedVisits((prev) => [...prev, getInitialVisitData()]);
    setActiveVisitIndex(managedVisits.length);
  };

  const handleProfileChange = (e) =>
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleVisitChange = (e) => {
    if (!managedVisits[activeVisitIndex]) return;
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    const updatedVisits = [...managedVisits];
    updatedVisits[activeVisitIndex] = {
      ...updatedVisits[activeVisitIndex],
      [name]: val,
    };

    if (name === "selectedLab") {
      const selectedLabObject = labs.find((lab) => lab.name === val);
      updatedVisits[activeVisitIndex].labCharge = selectedLabObject
        ? selectedLabObject.price
        : 0;
    }

    setManagedVisits(updatedVisits);
  };

  const handleTreatmentChange = (treatmentIndex, e) => {
    if (!managedVisits[activeVisitIndex]?.treatments) return;
    const { name, value } = e.target;
    const updatedVisits = [...managedVisits];
    const newTreatments = [...updatedVisits[activeVisitIndex].treatments];
    newTreatments[treatmentIndex] = {
      ...newTreatments[treatmentIndex],
      [name]: value,
    };
    updatedVisits[activeVisitIndex].treatments = newTreatments;
    setManagedVisits(updatedVisits);
  };

  const handleAddTreatment = () => {
    if (!managedVisits[activeVisitIndex]) return;
    const updatedVisits = [...managedVisits];
    if (!updatedVisits[activeVisitIndex].treatments)
      updatedVisits[activeVisitIndex].treatments = [];
    updatedVisits[activeVisitIndex].treatments.push({ name: "", price: "" });
    setManagedVisits(updatedVisits);
  };

  const handleRemoveTreatment = (treatmentIndex) => {
    if (!managedVisits[activeVisitIndex]?.treatments) return;
    const updatedVisits = [...managedVisits];
    updatedVisits[activeVisitIndex].treatments = updatedVisits[
      activeVisitIndex
    ].treatments.filter((_, i) => i !== treatmentIndex);
    setManagedVisits(updatedVisits);
  };

  const handleMedicineSelection = useCallback(
    (selectedNames) => {
      if (!managedVisits[activeVisitIndex]) return;
      const currentSelection =
        managedVisits[activeVisitIndex].selectedMedicines || [];
      const newSelection = selectedNames.map((name) => {
        const existing = currentSelection.find((m) => m.name === name);
        return (
          existing || {
            name,
            quantity: 1,
            pricePerUnit: getMedicinePrice(name) || 0,
          }
        );
      });
      const updatedVisits = [...managedVisits];
      updatedVisits[activeVisitIndex] = {
        ...updatedVisits[activeVisitIndex],
        selectedMedicines: newSelection,
      };
      setManagedVisits(updatedVisits);
    },
    [activeVisitIndex, managedVisits, getMedicinePrice]
  );

  const handleMedicineQuantityChange = useCallback(
    (medName, quantity) => {
      if (!managedVisits[activeVisitIndex]?.selectedMedicines) return;
      const newSelection = managedVisits[
        activeVisitIndex
      ].selectedMedicines.map((med) =>
        med.name === medName ? { ...med, quantity: Number(quantity) || 0 } : med
      );
      const updatedVisits = [...managedVisits];
      updatedVisits[activeVisitIndex] = {
        ...updatedVisits[activeVisitIndex],
        selectedMedicines: newSelection,
      };
      setManagedVisits(updatedVisits);
    },
    [activeVisitIndex, managedVisits]
  );

  const handleDuesPayment = () => {
    const duesAmount = Number(duesPaid);
    if (!patient || !duesAmount || duesAmount <= 0) {
      showNotification(
        "Please enter a valid dues amount to record.",
        "warning"
      );
      return;
    }

    const duesVisit = {
      ...getInitialVisitData(),
      date: dayjs(duesPaidDate).format("YYYY-MM-DD"),
      doctor: "N/A",
      chiefComplaint: `Dues payment of ₹${duesAmount.toFixed(2)}`,
      paidAmount: duesAmount,
      paymentMode: duesPaymentMode,
      isDuesPayment: true,
      treatments: [],
      selectedMedicines: [],
      includeConsultationFee: false,
      includeXrayFee: false,
      selectedLab: "",
    };

    setManagedVisits((prev) => [...prev, duesVisit]);
    setActiveVisitIndex(managedVisits.length);

    setDuesPaid("");
    showNotification(
      "Dues payment has been staged. Click 'Save All Changes' to confirm.",
      "info"
    );
  };

  const handleSubmit = async () => {
    const cleanVisits = managedVisits.map((v) => {
      const visitPayload = { ...v };

      if (String(visitPayload._id).startsWith("new_")) {
        delete visitPayload._id;
      }

      visitPayload.treatments =
        visitPayload.treatments?.filter(
          (t) => t.name && t.name.trim() !== ""
        ) || [];

      visitPayload.medicines = (visitPayload.selectedMedicines || []).map(
        (med) => ({
          name: med.name,
          quantity: med.quantity,
          pricePerUnit: med.pricePerUnit,
        })
      );
      delete visitPayload.selectedMedicines;

      return visitPayload;
    });

    const lastVisit = managedVisits[managedVisits.length - 1];
    const finalPendingAmount = lastVisit
      ? lastVisit.pendingAmount
      : patient?.pendingAmount || 0;
    const finalTotalEarnings = lastVisit
      ? lastVisit.totalEarnings
      : patient?.totalEarnings || 0;

    const payload = {
      ...profileData,
      visitHistory: cleanVisits,
      pendingAmount: finalPendingAmount,
      totalEarnings: finalTotalEarnings,
    };

    try {
      if (patient) {
        await api.put(`/api/patients/${patient._id}`, payload);
        onUpdated(patient._id);
      } else {
        const response = await api.post("/api/patients", payload);
        onUpdated(response.data.patient._id);
      }
      showNotification("Patient data saved successfully", "success");
      onClose();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to save data",
        "error"
      );
    }
  };

  const activeVisitData = managedVisits[activeVisitIndex] || {};

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            onClose();
          } else {
            handleAttemptClose();
          }
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" component="div">
            {patient ? `Manage Visits for ${patient.name}` : "Add New Patient"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {patient && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleStartNewVisit}
            >
              Start New Visit
            </Button>
          )}
          <IconButton onClick={handleAttemptClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {patient && (
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
                    ₹{cumulativeFinancials.totalCharges.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ₹{Number(cumulativeFinancials.totalPaid || 0).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Final Pending
                  </Typography>
                  <Typography
                    variant="h6"
                    color={
                      cumulativeFinancials.pendingAmount > 0
                        ? "error.main"
                        : "success.main"
                    }
                  >
                    ₹{cumulativeFinancials.pendingAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Clinic Earnings
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    ₹{cumulativeFinancials.totalEarnings.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
          {managedVisits.length > 0 && (
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={activeVisitIndex}
                onChange={(e, val) => setActiveVisitIndex(val)}
                variant="scrollable"
              >
                {managedVisits.map((visit, index) => {
                  let tabLabel = "";

                  if (visit.isDuesPayment) {
                    tabLabel = `Dues Payment on ${dayjs(visit.date).format(
                      "DD MMM 'YY"
                    )}`;
                  } else {
                    const isNewUnsavedVisit =
                      !patient ||
                      (index >= (patient?.visitHistory?.length || 0) &&
                        !visit.isDuesPayment);

                    const visitDate = dayjs(visit.date).format("DD MMM 'YY");

                    if (isNewUnsavedVisit) {
                      tabLabel = "New Clinical Visit";
                    } else {
                      tabLabel = `Visit on ${visitDate}`;
                    }
                  }

                  return (
                    <Tab
                      label={tabLabel}
                      key={visit._id || `new-visit-${index}`}
                    />
                  );
                })}
              </Tabs>
            </Box>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="h6">Patient Details</Typography>
                <TextField
                  name="name"
                  label="Name"
                  value={profileData.name || ""}
                  onChange={handleProfileChange}
                  fullWidth
                  disabled={!!patient}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    name="age"
                    label="Age"
                    type="number"
                    value={profileData.age || ""}
                    onChange={handleProfileChange}
                    fullWidth
                  />
                  <TextField
                    name="gender"
                    label="Gender"
                    value={profileData.gender || ""}
                    onChange={handleProfileChange}
                    fullWidth
                  />
                </Stack>
                <TextField
                  name="phoneNumber"
                  label="Phone Number"
                  value={profileData.phoneNumber || ""}
                  onChange={handleProfileChange}
                  fullWidth
                />
                <TextField
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={profileData.address || ""}
                  onChange={handleProfileChange}
                  fullWidth
                />
                <TextField
                  name="additionalInfo"
                  label="Additional Info"
                  multiline
                  rows={2}
                  value={profileData.additionalInfo || ""}
                  onChange={handleProfileChange}
                  fullWidth
                />
                <TextField
                  name="medicalHistory"
                  label="Medical History"
                  multiline
                  rows={2}
                  value={profileData.medicalHistory || ""}
                  onChange={handleProfileChange}
                  fullWidth
                />
                <TextField
                  name="dentalHistory"
                  label="Dental History"
                  multiline
                  rows={2}
                  value={profileData.dentalHistory || ""}
                  onChange={handleProfileChange}
                  fullWidth
                />

                <Divider sx={{ my: 1 }} />
                <Typography variant="h6">Visit Details</Typography>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  value={
                    dayjs(activeVisitData.date).isValid()
                      ? dayjs(activeVisitData.date).format("YYYY-MM-DD")
                      : dayjs().format("YYYY-MM-DD")
                  }
                  onChange={handleVisitChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    name="doctor"
                    value={activeVisitData.doctor || ""}
                    label="Doctor"
                    onChange={handleVisitChange}
                    disabled={activeVisitData.isDuesPayment}
                  >
                    {doctors.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  name="chiefComplaint"
                  label="Chief Complaint"
                  multiline
                  rows={3}
                  value={activeVisitData.chiefComplaint || ""}
                  onChange={handleVisitChange}
                  fullWidth
                  disabled={activeVisitData.isDuesPayment}
                />

                <TextField
                  name="nextAppointment"
                  label="Next Appointment Date"
                  type="date"
                  value={profileData.nextAppointment || ""}
                  onChange={handleProfileChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={activeVisitData.isConsultationOnly || false}
                      onChange={handleVisitChange}
                      name="isConsultationOnly"
                    />
                  }
                  label="Only for Consultation"
                  disabled={activeVisitData.isDuesPayment}
                />
                <fieldset
                  disabled={
                    activeVisitData.isConsultationOnly ||
                    activeVisitData.isDuesPayment
                  }
                  style={{ border: "none", padding: 0, margin: 0 }}
                >
                  <Box
                    sx={{ border: "1px solid #ccc", borderRadius: "4px", p: 2 }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Treatments
                    </Typography>
                    <TextField
                      name="treatmentPlan"
                      label="Treatment Plan"
                      fullWidth
                      value={activeVisitData.treatmentPlan || ""}
                      onChange={handleVisitChange}
                      sx={{ mb: 2 }}
                    />
                    {(activeVisitData.treatments || []).map(
                      (treatment, index) => (
                        <Grid
                          container
                          spacing={1}
                          key={index}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Grid item xs={6}>
                            <TextField
                              name="name"
                              label={`Treatment ${index + 1}`}
                              fullWidth
                              value={treatment.name}
                              onChange={(e) => handleTreatmentChange(index, e)}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              name="price"
                              label="Price"
                              fullWidth
                              type="number"
                              value={treatment.price}
                              onChange={(e) => handleTreatmentChange(index, e)}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <IconButton
                              onClick={() => handleRemoveTreatment(index)}
                              color="error"
                              disabled={activeVisitData.treatments?.length <= 1}
                            >
                              <RemoveCircleOutlineIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      )
                    )}
                    <Button
                      onClick={handleAddTreatment}
                      startIcon={<AddCircleOutlineIcon />}
                      variant="text"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Add Treatment
                    </Button>
                  </Box>
                </fieldset>

                <MedicineSelection
                  medicines={medicines}
                  selectedMedicines={activeVisitData.selectedMedicines || []}
                  medicineTotal={activeVisitData.medicineCharge || 0}
                  handleMedicineSelection={handleMedicineSelection}
                  handleQuantityChange={handleMedicineQuantityChange}
                  disabled={activeVisitData.isDuesPayment}
                />

                <Divider sx={{ my: 1 }} />
                <Typography variant="h6">Fees & Payment</Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          activeVisitData.includeConsultationFee || false
                        }
                        onChange={handleVisitChange}
                        name="includeConsultationFee"
                      />
                    }
                    label={`Consult. Fee (₹${consultationFee})`}
                    disabled={activeVisitData.isDuesPayment}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={activeVisitData.includeXrayFee || false}
                        onChange={handleVisitChange}
                        name="includeXrayFee"
                      />
                    }
                    label={`X-Ray Fee (₹${xrayFee})`}
                    disabled={activeVisitData.isDuesPayment}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Lab Work</InputLabel>
                    <Select
                      name="selectedLab"
                      value={activeVisitData.selectedLab || ""}
                      label="Lab Work"
                      onChange={handleVisitChange}
                      disabled={
                        activeVisitData.isConsultationOnly ||
                        activeVisitData.isDuesPayment
                      }
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {labs.map((lab) => (
                        <MenuItem key={lab._id} value={lab.name}>
                          {lab.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    name="labCharge"
                    label="Lab Charges"
                    fullWidth
                    type="number"
                    value={activeVisitData.labCharge || 0}
                    onChange={handleVisitChange}
                    disabled={
                      !activeVisitData.selectedLab ||
                      activeVisitData.isConsultationOnly ||
                      activeVisitData.isDuesPayment
                    }
                  />
                </Stack>

                {!activeVisitData.isDuesPayment && (
                  <TextField
                    name="visitCharge"
                    label="Charge for This Visit"
                    fullWidth
                    type="number"
                    value={activeVisitData.visitCharge?.toFixed(2) || "0.00"}
                    disabled
                    InputProps={{ readOnly: true }}
                    sx={{ backgroundColor: "#f0f4c3" }}
                  />
                )}

                <TextField
                  name="totalCharge"
                  label="Cumulative Total Charge"
                  fullWidth
                  type="number"
                  value={activeVisitData.totalCharge?.toFixed(2) || "0.00"}
                  disabled
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  name="paidAmount"
                  label="Amount Paid (This Visit/Payment)"
                  fullWidth
                  type="number"
                  value={
                    activeVisitData.paidAmount === 0
                      ? 0
                      : activeVisitData.paidAmount || ""
                  }
                  onChange={handleVisitChange}
                />
                <FormControl fullWidth>
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    name="paymentMode"
                    label="Payment Mode"
                    value={activeVisitData.paymentMode || "Gpay"}
                    onChange={handleVisitChange}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Gpay">GPay</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  name="pendingAmount"
                  label="Cumulative Pending Amount"
                  fullWidth
                  type="number"
                  value={
                    activeVisitData.pendingAmount === 0
                      ? 0
                      : activeVisitData.pendingAmount || ""
                  }
                  disabled
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  name="totalEarnings"
                  label="Cumulative Total Earnings"
                  fullWidth
                  type="number"
                  value={activeVisitData.totalEarnings?.toFixed(2) || "0.00"}
                  disabled
                  InputProps={{ readOnly: true }}
                />
              </Stack>
            </Grid>
          </Grid>

          {patient && (
            <>
              <Divider sx={{ my: 3 }}>
                <Chip label="RECORD PAYMENT FOR PAST DUES" />
              </Divider>
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Use this section ONLY to record a payment for a previous
                  outstanding balance. This will create a new 'Dues Payment'
                  tab.
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
                    onChange={(e) => setDuesPaid(e.target.value)}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      value={duesPaymentMode}
                      label="Payment Mode"
                      onChange={(e) => setDuesPaymentMode(e.target.value)}
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Gpay">GPay</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    type="date"
                    label="Date of Payment"
                    value={duesPaidDate}
                    onChange={(e) => setDuesPaidDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDuesPayment}
                    sx={{ flexShrink: 0 }}
                    disabled={!duesPaid || Number(duesPaid) <= 0}
                  >
                    Stage Dues Payment
                  </Button>
                </Stack>
              </Paper>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleAttemptClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save All Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConfirmClose} onClose={() => handleConfirmClose(false)}>
        <DialogTitle>Discard Unsaved Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to close and discard
            them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmClose(false)} color="primary">
            Keep Editing
          </Button>
          <Button
            onClick={() => handleConfirmClose(true)}
            color="error"
            variant="contained"
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientModal;
