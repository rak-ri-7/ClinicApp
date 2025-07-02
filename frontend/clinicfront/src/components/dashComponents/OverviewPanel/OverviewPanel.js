import React, { useEffect, useState, useContext } from "react"; // Add useContext
import /* ... MUI imports ... */ "@mui/material";
import api from "../../../api";
import { MedicinesContext } from "../../../context/MedicinesContext"; // Import the context
import { formatPendingAmount } from "../../../utils/formatters";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Tooltip, // Import Tooltip
} from "@mui/material";

import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// StatCardMinimal component remains the same as the last version (with the color prop)
const StatCardMinimal = ({
  title,
  value,
  subValue,
  Icon,
  isLoading,
  color = "primary.main",
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: color === "error.main" ? "error.light" : "grey.200",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          textAlign: "center",
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Icon
          sx={{
            fontSize: "2.5rem",
            color: color,
            mb: 1.5,
            alignSelf: "center",
          }}
        />
        {isLoading ? (
          <CircularProgress size={36} />
        ) : (
          <Box>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {value}
            </Typography>
            {subValue && (
              <Typography variant="body2" color="text.secondary">
                {subValue}
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};
// --- The Main OverviewPanel Component (FIXED & SELF-SUFFICIENT) ---
const OverviewPanel = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // *** 1. Consume the MedicinesContext directly inside this component ***
  const { lowStockMedicines } = useContext(MedicinesContext);

  // The useEffect for fetching patient stats remains the same
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/patients");
        const patients = response.data;

        const totalPatients = patients.length;
        const totalRevenue = patients.reduce(
          (sum, p) => sum + (Number(p.totalEarnings) || 0),
          0
        );
        const pendingPayments = patients.reduce((sum, p) => {
          if (p.visitHistory && p.visitHistory.length > 0) {
            // Get the last visit object
            const lastVisit = p.visitHistory[p.visitHistory.length - 1];
            // Add its pendingAmount to the running total
            return sum + (Number(lastVisit.pendingAmount) || 0);
          }
          // If a patient has no visit history, their pending amount is 0.
          return sum;
        }, 0);
        const patientsWithPending = patients.filter(
          (p) => Number(p.pendingAmount) > 0
        ).length;
        const upcomingAppointments = patients.filter(
          (p) => p.nextAppointment
        ).length;
        const returningPatients = patients.filter(
          (p) => p.appointmentHistory && p.appointmentHistory.length > 1
        ).length;

        setStats({
          totalPatients,
          returningPatients,
          totalRevenue,
          pendingPayments,
          upcomingAppointments,
          patientsWithPending,
        });
      } catch (error) {
        console.error("Error fetching patient stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num) =>
    typeof num === "number" ? new Intl.NumberFormat("en-IN").format(num) : "0";
  const formatCurrency = (num) =>
    typeof num === "number"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
        }).format(num)
      : "₹0";

  // *** 2. The cardData array now reliably builds itself from this component's data ***
  const cardData = [
    {
      title: "Returning / Total",
      Icon: PeopleOutlineIcon,
      value: `${formatNumber(stats?.returningPatients)} / ${formatNumber(
        stats?.totalPatients
      )}`,
      subValue: "Patients",
      isLoading: isLoading,
    },
    {
      title: "Low Stock Items",
      Icon: WarningAmberIcon,
      value: formatNumber(lowStockMedicines.length), // Use the context value directly
      color: lowStockMedicines.length > 0 ? "error.main" : "success.main",
      isLoading: false, // This is never loading, it's ready when context is
    },
    {
      title: "Total Revenue",
      Icon: TrendingUpIcon,
      value: formatCurrency(stats?.totalRevenue),
      isLoading: isLoading,
    },
    {
      title: "Pending Payments",
      Icon: HourglassTopIcon,
      // *** THE FIX: Use 'pendingPayments' to match the state key ***
      value: formatPendingAmount(stats?.pendingPayments).main,
      subValue: formatPendingAmount(stats?.pendingPayments).detail,
      isLoading: isLoading,
      // Also fix the color logic to use the correct key
      color: stats?.pendingPayments < 0 ? "info.main" : "primary.main",
    },
    {
      title: "Patients with Dues",
      Icon: ErrorOutlineIcon,
      value: formatNumber(stats?.patientsWithPending),
      isLoading: isLoading,
    },
    {
      title: "Upcoming Appointments",
      Icon: EventNoteIcon,
      value: formatNumber(stats?.upcomingAppointments),
      isLoading: isLoading,
    },
  ];

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "600", color: "text.primary", mb: 3 }}
      >
        At a Glance
      </Typography>
      <Grid container spacing={3}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCardMinimal
              title={card.title}
              Icon={card.Icon}
              // The isLoading prop is now much simpler
              isLoading={card.isLoading}
              value={card.isLoading ? "..." : card.value}
              subValue={card.subValue}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewPanel;
