import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Grid,
  Button,
  Typography,
} from "@mui/material";
import api from "../../../api";
import dayjs from "dayjs";

// Contexts & Hooks
import { MedicinesContext } from "../../../context/MedicinesContext";
import { ConsultationFeeContext } from "../../../context/ConsultationFeeContext";
import { XrayFeeContext } from "../../../context/XrayFeeContext";
import { LabContext } from "../../../context/LabContext";
import { DoctorsContext } from "../../../context/DoctorsContext";
import { useNotification } from "../../../context/NotificationContext";

// Refactored Components
import PatientModalHeader from "./PatientModalComponents/PatientModalHeader";
import FinancialSummary from "./PatientModalComponents/FinancialSummary";
import VisitTabs from "./PatientModalComponents/VisitTabs";
import PatientDetailsForm from "./PatientModalComponents/PatientDetailsForm";
import VisitBillingForm from "./PatientModalComponents/VisitBillingForm";
import DuesPaymentSection from "./PatientModalComponents/DuesPaymentSection";
import DuplicatePatientDialog from "./DuplicatePatientDialog";

// Utilities
import { calculateVisitCharges as calculateCharges } from "../../../utils/FinancialCalculations";

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
  isFollowUp: false,
});

const PatientModal = ({ patient, open, onClose, onUpdated }) => {
  const { medicines, getMedicinePrice } = useContext(MedicinesContext);
  const { consultationFee } = useContext(ConsultationFeeContext);
  const { xrayFee } = useContext(XrayFeeContext);
  const { labs } = useContext(LabContext);
  const { doctors } = useContext(DoctorsContext);
  const { showNotification } = useNotification();

  // State Management (remains in the parent component)
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
  const [potentialDuplicates, setPotentialDuplicates] = useState([]);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateCheckConfirmed, setDuplicateCheckConfirmed] = useState(false);
  const [duplicateCheckTimeout, setDuplicateCheckTimeout] = useState(null);

  // Memoized calculation function
  const calculateVisits = useCallback(() => {
    return calculateCharges(managedVisits, consultationFee, xrayFee, doctors);
  }, [managedVisits, consultationFee, xrayFee, doctors]);

  // Effects
  useEffect(() => {
    if (open) {
      // Reset dues payment form on every open
      setDuesPaid("");
      setDuesPaidDate(dayjs().format("YYYY-MM-DD"));
      setDuesPaymentMode("Cash");

      if (patient) {
        // --- LOGIC FOR EXISTING PATIENT ---
        const snapshotProfile = {
          name: patient.name || "",
          age: patient.age || "",
          gender: patient.gender || "",
          phoneNumber: patient.phoneNumber || "",
          address: patient.address || "",
          additionalInfo: patient.additionalInfo || "",
          medicalHistory: patient.medicalHistory || "",
          dentalHistory: patient.dentalHistory || "",
          nextAppointment: patient.nextAppointment?.split("T")[0] || "",
        };

        // 1. Get the base visits from the patient prop
        const baseVisits = (
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

        // 2. Perform calculations ONCE
        const calculatedVisits = calculateCharges(
          baseVisits,
          consultationFee,
          xrayFee,
          doctors
        );

        // 3. Set the initial state snapshot using the *calculated* data
        setInitialState({
          profile: snapshotProfile,
          visits: JSON.parse(JSON.stringify(calculatedVisits)),
        });

        // 4. Set the component's working state to the same calculated data
        setProfileData(snapshotProfile);
        setManagedVisits(calculatedVisits);
        setActiveVisitIndex(calculatedVisits.length - 1);
      } else {
        // --- LOGIC FOR NEW PATIENT ---
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

        // 1. Get the base visit for a new patient
        const baseNewVisits = [getInitialVisitData()];

        // 2. Perform calculations ONCE
        const calculatedNewVisits = calculateCharges(
          baseNewVisits,
          consultationFee,
          xrayFee,
          doctors
        );

        // 3. Set the initial state snapshot using the *calculated* data
        setInitialState({
          profile: newPatientProfile,
          visits: JSON.parse(JSON.stringify(calculatedNewVisits)),
        });

        // 4. Set the component's working state to the same calculated data
        setProfileData(newPatientProfile);
        setManagedVisits(calculatedNewVisits);
        setActiveVisitIndex(0);

        // Reset duplicate check state
        setPotentialDuplicates([]);
        setIsDuplicateDialogOpen(false);
        setDuplicateCheckConfirmed(false);
      }
    }
  }, [patient, open, consultationFee, xrayFee, doctors]);

  useEffect(() => {
    if (!open) return;
    const recalculatedVisits = calculateVisits();
    if (JSON.stringify(recalculatedVisits) !== JSON.stringify(managedVisits)) {
      setManagedVisits(recalculatedVisits);
    }
  }, [managedVisits, open, calculateVisits]);

  useEffect(() => {
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
  }, [managedVisits]);

  // Handlers (all logic remains here)
  const isFormDirty = () =>
    JSON.stringify(initialState) !==
    JSON.stringify({ profile: profileData, visits: managedVisits });
  const handleAttemptClose = () =>
    isFormDirty() ? setShowConfirmClose(true) : onClose();
  const handleConfirmClose = (confirmed) => {
    setShowConfirmClose(false);
    if (confirmed) onClose();
  };
  const handleStartNewVisit = () => {
    setManagedVisits((prev) => [...prev, getInitialVisitData()]);
    setActiveVisitIndex(managedVisits.length);
  };
  const handleStartFollowUpVisit = () => {
    if (!patient || !profileData.nextAppointment) return;
    const schedulingVisit = [...patient.visitHistory]
      .reverse()
      .find((v) => !v.isDuesPayment);
    const followUpVisit = {
      ...getInitialVisitData(),
      date: dayjs(profileData.nextAppointment).format("YYYY-MM-DD"),
      doctor: schedulingVisit?.doctor || "",
      chiefComplaint:
        schedulingVisit?.chiefComplaint || "Follow-up appointment",
      isFollowUp: true,
    };
    setManagedVisits((prev) => [...prev, followUpVisit]);
    setActiveVisitIndex(managedVisits.length);
    setProfileData((prev) => ({ ...prev, nextAppointment: "" }));
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && !patient && !duplicateCheckConfirmed) {
      if (duplicateCheckTimeout) clearTimeout(duplicateCheckTimeout);
      if (!value || value.trim().length < 3) return;
      const newTimeout = setTimeout(async () => {
        try {
          const res = await api.get("/api/patients/check-name", {
            params: { name: value.trim() },
          });
          if (res.data?.length > 0) {
            setPotentialDuplicates(res.data);
            setIsDuplicateDialogOpen(true);
          }
        } catch (error) {
          showNotification("Could not check for duplicates.", "warning");
        }
      }, 1000);
      setDuplicateCheckTimeout(newTimeout);
    }
  };
  const handleVisitChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    const updatedVisits = [...managedVisits];
    updatedVisits[activeVisitIndex] = {
      ...updatedVisits[activeVisitIndex],
      [name]: val,
    };
    if (name === "doctor") {
      const selectedDoctor = doctors.find((d) => d.name === val);
      if (selectedDoctor?.paymentModel === "Fixed")
        updatedVisits[activeVisitIndex].specialistFee = 0;
    }
    if (name === "selectedLab") {
      const lab = labs.find((l) => l.name === val);
      updatedVisits[activeVisitIndex].labCharge = lab ? lab.price : 0;
    }
    setManagedVisits(updatedVisits);
  };
  const handleTreatmentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVisits = [...managedVisits];
    const newTreatments = [...updatedVisits[activeVisitIndex].treatments];
    newTreatments[index] = { ...newTreatments[index], [name]: value };
    updatedVisits[activeVisitIndex].treatments = newTreatments;
    setManagedVisits(updatedVisits);
  };
  const handleAddTreatment = () => {
    const updatedVisits = [...managedVisits];
    updatedVisits[activeVisitIndex].treatments.push({ name: "", price: "" });
    setManagedVisits(updatedVisits);
  };
  const handleRemoveTreatment = (index) => {
    const updatedVisits = [...managedVisits];
    updatedVisits[activeVisitIndex].treatments = updatedVisits[
      activeVisitIndex
    ].treatments.filter((_, i) => i !== index);
    setManagedVisits(updatedVisits);
  };
  const handleMedicineSelection = useCallback(
    (selectedNames) => {
      const updatedVisits = [...managedVisits];
      const currentSelection =
        updatedVisits[activeVisitIndex].selectedMedicines || [];
      updatedVisits[activeVisitIndex].selectedMedicines = selectedNames.map(
        (name) =>
          currentSelection.find((m) => m.name === name) || {
            name,
            quantity: 1,
            pricePerUnit: getMedicinePrice(name) || 0,
          }
      );
      setManagedVisits(updatedVisits);
    },
    [activeVisitIndex, managedVisits, getMedicinePrice]
  );
  const handleMedicineQuantityChange = useCallback(
    (medName, quantity) => {
      const updatedVisits = [...managedVisits];
      updatedVisits[activeVisitIndex].selectedMedicines = updatedVisits[
        activeVisitIndex
      ].selectedMedicines.map((med) =>
        med.name === medName ? { ...med, quantity: Number(quantity) || 0 } : med
      );
      setManagedVisits(updatedVisits);
    },
    [activeVisitIndex, managedVisits]
  );
  const handleDuesPayment = () => {
    const duesAmount = Number(duesPaid);
    if (!patient || duesAmount <= 0) {
      showNotification("Please enter a valid dues amount.", "warning");
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
    };
    setManagedVisits((prev) => [...prev, duesVisit]);
    setActiveVisitIndex(managedVisits.length);
    setDuesPaid("");
    showNotification("Dues payment staged. Click 'Save' to confirm.", "info");
  };
  const handleDuplicateDialogClose = () => setIsDuplicateDialogOpen(false);
  const handleDuplicateDialogConfirm = () => {
    setDuplicateCheckConfirmed(true);
    setIsDuplicateDialogOpen(false);
  };
  const handleCancelAndCloseAll = () => {
    setIsDuplicateDialogOpen(false);
    onClose();
  };
  const handleSubmit = async () => {
    const cleanVisits = managedVisits.map((v) => {
      const visitPayload = { ...v };
      if (String(visitPayload._id).startsWith("new_")) delete visitPayload._id;
      visitPayload.treatments =
        visitPayload.treatments?.filter((t) => t.name?.trim()) || [];
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
    const payload = {
      ...profileData,
      visitHistory: cleanVisits,
      pendingAmount: lastVisit?.pendingAmount || 0,
      totalEarnings: lastVisit?.totalEarnings || 0,
    };
    try {
      const response = patient
        ? await api.put(`/api/patients/${patient._id}`, payload)
        : await api.post("/api/patients", payload);
      onUpdated(response.data.patient._id);
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
  const isSpecialistFeeDisabled = () => {
    const selectedDoctor = doctors.find(
      (d) => d.name === activeVisitData.doctor
    );
    return !selectedDoctor || selectedDoctor.paymentModel !== "Fixed";
  };

  return (
    <>
      <Dialog open={open} onClose={handleAttemptClose} fullWidth maxWidth="lg">
        <PatientModalHeader
          patient={patient}
          profileData={profileData}
          managedVisits={managedVisits}
          onStartFollowUp={handleStartFollowUpVisit}
          onStartNewVisit={handleStartNewVisit}
          onClose={handleAttemptClose}
        />
        <DialogContent dividers>
          <FinancialSummary
            financials={cumulativeFinancials}
            patient={patient}
          />
          <VisitTabs
            visits={managedVisits}
            activeIndex={activeVisitIndex}
            onTabChange={(e, val) => setActiveVisitIndex(val)}
            patient={patient}
          />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <PatientDetailsForm
                profileData={profileData}
                onProfileChange={handleProfileChange}
                activeVisit={activeVisitData}
                onVisitChange={handleVisitChange}
                doctors={doctors}
                isPatient={!!patient}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <VisitBillingForm
                activeVisit={activeVisitData}
                onVisitChange={handleVisitChange}
                onTreatmentChange={handleTreatmentChange}
                onAddTreatment={handleAddTreatment}
                onRemoveTreatment={handleRemoveTreatment}
                onMedicineSelection={handleMedicineSelection}
                onMedicineQuantityChange={handleMedicineQuantityChange}
                isSpecialistFeeDisabled={isSpecialistFeeDisabled}
                medicines={medicines}
              />
            </Grid>
          </Grid>
          <DuesPaymentSection
            patient={patient}
            duesPaid={duesPaid}
            onDuesPaidChange={(e) => setDuesPaid(e.target.value)}
            duesPaymentMode={duesPaymentMode}
            onDuesPaymentModeChange={(e) => setDuesPaymentMode(e.target.value)}
            duesPaidDate={duesPaidDate}
            onDuesPaidDateChange={(e) => setDuesPaidDate(e.target.value)}
            onStageDuesPayment={handleDuesPayment}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAttemptClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save All Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Auxiliary Dialogs --- */}
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
      <DuplicatePatientDialog
        open={isDuplicateDialogOpen}
        duplicates={potentialDuplicates}
        onClose={handleDuplicateDialogClose}
        onConfirmNew={handleDuplicateDialogConfirm}
        onCancel={handleCancelAndCloseAll}
      />
    </>
  );
};

export default PatientModal;
