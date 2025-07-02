import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Grid,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Chrono } from "react-chrono";
import api from "../../../api";
import dayjs from "dayjs";
import DentalChartView from "./DentalChartView";
import { formatPendingAmount } from "../../../utils/formatters";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import HealingIcon from "@mui/icons-material/Healing";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import BookIcon from "@mui/icons-material/Book";
import HistoryIcon from "@mui/icons-material/History";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import InfoIcon from "@mui/icons-material/Info";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

// --- Sub-components (Unchanged) ---
const DetailItem = ({
  icon: Icon,
  label,
  value,
  detail,
  color = "primary.main",
}) => (
  <Stack direction="row" alignItems="center" spacing={1.5}>
    <Icon sx={{ color, fontSize: "20px" }} />
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", lineHeight: 1 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="500">
        {value || "N/A"}
      </Typography>
      {detail && (
        <Typography
          variant="caption"
          color={color}
          sx={{ fontStyle: "italic" }}
        >
          {detail}
        </Typography>
      )}
    </Box>
  </Stack>
);

const InfoBlock = ({ icon: Icon, label, children, value }) => (
  <Box>
    <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
      <Icon sx={{ color: "text.secondary", fontSize: "18px" }} />
      <Typography variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
    </Stack>
    <Box sx={{ pl: 4.5 }}>
      {children || (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {value || "No information provided."}
        </Typography>
      )}
    </Box>
  </Box>
);

// --- Main History Component ---

const PatientHistory = ({ open, onClose, patient }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patient?._id) return;

      try {
        setLoading(true);
        const response = await api.get(`/api/patients/${patient._id}`);
        setPatientData(response.data);
      } catch (error) {
        console.error("Error fetching patient history:", error);
        setPatientData(null);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPatientData();
    } else {
      setPatientData(null);
    }
  }, [open, patient?._id]);

  // In PatientHistory.js

  const financialSummary = useMemo(() => {
    // If there's no visit history, there are no financials. Return defaults.
    if (!patientData?.visitHistory || patientData.visitHistory.length === 0) {
      return { pendingAmount: 0, duesHistory: [] };
    }

    // =================================================================
    // THE FIX: Calculate the pending amount from the source of truth.
    // =================================================================

    // 1. Get the last visit to find the final cumulative charge.
    const lastVisit =
      patientData.visitHistory[patientData.visitHistory.length - 1];
    const totalCharges = lastVisit.totalCharge || 0;

    // 2. Calculate the true total amount paid by summing up every payment across all visits.
    const totalPaid = patientData.visitHistory.reduce(
      (sum, visit) => sum + (visit.paidAmount || 0),
      0
    );

    // 3. The definitive pending amount is the difference.
    const pendingAmount = totalCharges - totalPaid;

    // The dues history logic is correct and remains the same.
    const duesHistory = patientData.visitHistory.filter(
      (visit) => visit.isDuesPayment === true
    );

    return { pendingAmount, duesHistory };
  }, [patientData]);

  const appointments = useMemo(() => {
    if (!patientData?.visitHistory) return [];
    return patientData.visitHistory
      .filter((visit) => !visit.isDuesPayment)
      .reverse();
  }, [patientData]);

  const timelineItems = useMemo(
    () =>
      appointments.map((visit) => ({
        title: dayjs(visit.date).format("DD MMMM YYYY"),
        cardTitle: `Seen by: Dr. ${visit.doctor || "N/A"}`,
      })),
    [appointments]
  );

  const formattedPending = formatPendingAmount(financialSummary.pendingAmount);

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} PaperProps={{ sx: { p: 2 } }}>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Loading Patient History...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!patientData) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>Could not load patient data.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" scroll="body">
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center" }}>
        <PersonIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" component="div">
          {patientData.name}'s Dental Profile
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "grey.50", p: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} md={2}>
              <DetailItem
                icon={CakeIcon}
                label="Age"
                value={patientData.age}
                color="text.primary"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <DetailItem
                icon={WcIcon}
                label="Gender"
                value={patientData.gender}
                color="text.primary"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <DetailItem
                icon={PhoneIcon}
                label="Phone"
                value={patientData.phoneNumber}
                color="text.primary"
              />
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <DetailItem
                icon={AccountBalanceWalletIcon}
                label="Total Pending"
                value={formattedPending.main}
                detail={formattedPending.detail}
                color={formattedPending.isNegative ? "info.main" : "error.main"}
              />
            </Grid>
          </Grid>
          {patientData.nextAppointment && (
            <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="warning.dark"
              >
                Next Appointment:{" "}
                {dayjs(patientData.nextAppointment).format(
                  "dddd, DD MMMM YYYY"
                )}
              </Typography>
            </Box>
          )}
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Oral Examination</Typography>
                </Box>
                {patientData.dentalChart &&
                Object.keys(patientData.dentalChart).length > 0 ? (
                  <DentalChartView
                    dentalChart={patientData.dentalChart}
                    oralNotes={patientData.oralNotes}
                  />
                ) : (
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    No oral examination data recorded.
                  </Typography>
                )}
              </Paper>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2.5} divider={<Divider />}>
                  <InfoBlock
                    icon={AssignmentIcon}
                    label="Latest Complaint"
                    value={appointments[0]?.chiefComplaint}
                  />
                  <InfoBlock
                    icon={HealingIcon}
                    label="Medical History"
                    value={patientData.medicalHistory}
                  />
                  <InfoBlock
                    icon={BookIcon}
                    label="Dental History"
                    value={patientData.dentalHistory}
                  />
                  <InfoBlock
                    icon={HomeIcon}
                    label="Address"
                    value={patientData.address}
                  />
                  <InfoBlock
                    icon={InfoIcon}
                    label="Additional Info"
                    value={patientData.additionalInfo}
                  />

                  <InfoBlock icon={PaidIcon} label="Dues Paid History">
                    {financialSummary.duesHistory.length > 0 ? (
                      <Stack spacing={1}>
                        {financialSummary.duesHistory.map((due, index) => (
                          <Chip
                            key={index}
                            label={`₹${due.paidAmount} via ${
                              due.paymentMode
                            } on ${dayjs(due.date).format("DD MMM 'YY")}`}
                            variant="outlined"
                            color="success"
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No separate dues payments recorded.
                      </Typography>
                    )}
                  </InfoBlock>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <HistoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Clinical Visit History</Typography>
            </Box>
            <Box sx={{ width: "100%", minHeight: "600px" }}>
              {appointments.length > 0 ? (
                <Chrono
                  items={timelineItems}
                  mode="VERTICAL"
                  theme={{ primary: "#1976d2", secondary: "white" }}
                  fontSizes={{
                    cardSubtitle: "0.85rem",
                    cardText: "0.8rem",
                    cardTitle: "1rem",
                    title: "1rem",
                  }}
                  scrollable
                  allowDynamicUpdate
                  cardHeight={220}
                >
                  <div className="chrono-icons">
                    {appointments.map((_, index) => (
                      <PanoramaFishEyeIcon key={index} />
                    ))}
                  </div>
                  {appointments.map((visit, index) => (
                    <Box
                      key={index}
                      p={1.5}
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Stack spacing={1.5} flexGrow={1}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            Treatments:
                          </Typography>
                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={0.5}
                            mt={0.5}
                          >
                            {visit.treatments?.length > 0 ? (
                              visit.treatments.map((t, i) => (
                                <Chip
                                  key={i}
                                  label={`${t.name} (₹${t.price})`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Consultation
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            Treatment Plan:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {visit.treatmentPlan || "N/A"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            Medications:
                          </Typography>
                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={0.5}
                            mt={0.5}
                          >
                            {visit.medicines?.length > 0 ? (
                              visit.medicines.map((med, i) => (
                                <Chip
                                  key={i}
                                  label={`${med.name} (${med.quantity})`}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No medicines
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                      <Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          {/* =============================================== */}
                          {/* THE FIX IS HERE */}
                          {/* =============================================== */}
                          <Typography variant="body2" color="text.secondary">
                            Charge for this Visit:{" "}
                            <Typography component="span" fontWeight="bold">
                              ₹{visit.visitCharge || 0}
                            </Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Paid this Visit:{" "}
                            <Typography component="span" fontWeight="bold">
                              ₹{visit.paidAmount || 0}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ fontStyle: "italic", ml: 0.5 }}
                            >
                              ({visit.paymentMode})
                            </Typography>
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Chrono>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: "center", mt: 2 }}
                >
                  <ReceiptLongIcon
                    sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No Clinical Visits
                  </Typography>
                  <Typography color="text.secondary">
                    This patient does not have any clinical visit history
                    recorded yet.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientHistory;
