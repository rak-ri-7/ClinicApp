// src/components/dashboard/DailyActivityChart.js

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import api from "../../../api";
import dayjs from "dayjs";

// A simple custom tooltip for the new chart
const DailyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          style={{ color: payload[0].color, marginTop: "4px" }}
        >
          {`Patients: ${payload[0].value}`}
        </Typography>
        <Typography
          variant="body2"
          style={{ color: payload[1].color, marginTop: "4px" }}
        >
          {`Revenue: ₹${payload[1].value.toLocaleString("en-IN")}`}
        </Typography>
      </Card>
    );
  }
  return null;
};

const DailyActivityChart = () => {
  const [allPatients, setAllPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetDate, setTargetDate] = useState(dayjs()); // State to control the current week
  const theme = useTheme();

  // 1. Fetch all patient data ONCE when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/patients");
        setAllPatients(response.data);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 2. Process the data for the VISIBLE week using useMemo
  // This recalculates automatically when 'allPatients' or 'targetDate' changes
  const weeklyChartData = useMemo(() => {
    const startOfWeek = targetDate.startOf("week");
    const endOfWeek = targetDate.endOf("week");

    // Initialize an array for the 7 days of the week to ensure all days are shown
    const daysData = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.add(i, "day");
      daysData.push({
        name: currentDay.format("ddd"), // "Mon", "Tue", etc.
        fullDate: currentDay.format("YYYY-MM-DD"),
        Patients: 0,
        Revenue: 0,
      });
    }

    let totalWeeklyRevenue = 0;

    // Aggregate patient data into the daily buckets
    allPatients.forEach((patient) => {
      // IMPORTANT: Use the same date field as your other working chart!
      const visitDate = dayjs(patient.date);

      if (
        visitDate.isValid() &&
        visitDate.isBetween(
          startOfWeek.subtract(1, "day"),
          endOfWeek.add(1, "day")
        )
      ) {
        const dayIndex = visitDate.day(); // 0 for Sun, 1 for Mon, etc.
        // Adjust index if your week starts on Monday
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Assuming week starts on Monday

        if (daysData[adjustedIndex]) {
          daysData[adjustedIndex].Patients += 1;
          const revenue = Number(patient.totalEarnings) || 0;
          daysData[adjustedIndex].Revenue += revenue;
          totalWeeklyRevenue += revenue;
        }
      }
    });

    const weekDisplay = `${startOfWeek.format("MMM D")} - ${endOfWeek.format(
      "MMM D, YYYY"
    )}`;

    return { data: daysData, totalRevenue: totalWeeklyRevenue, weekDisplay };
  }, [allPatients, targetDate]);

  const handlePrevWeek = () => {
    setTargetDate(targetDate.subtract(1, "week"));
  };

  const handleNextWeek = () => {
    // Prevent navigating into the future
    if (targetDate.add(1, "week").isAfter(dayjs())) return;
    setTargetDate(targetDate.add(1, "week"));
  };

  const isNextWeekDisabled = targetDate
    .startOf("week")
    .isSame(dayjs().startOf("week"));

  return (
    <Card sx={{ borderRadius: 3, height: "100%", p: 1 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Daily Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {weeklyChartData.weekDisplay}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center">
            <Typography
              variant="h6"
              color="primary"
              sx={{ mr: 2, fontWeight: 600 }}
            >
              {`Total: ${new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
              }).format(weeklyChartData.totalRevenue)}`}
            </Typography>
            <IconButton onClick={handlePrevWeek} size="small">
              <ArrowBackIosNewIcon fontSize="inherit" />
            </IconButton>
            <IconButton
              onClick={handleNextWeek}
              size="small"
              disabled={isNextWeekDisabled}
            >
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 350,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart
              data={weeklyChartData.data}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.secondary }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke={theme.palette.primary.main}
                label={{
                  value: "Patient Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: theme.palette.text.secondary,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={theme.palette.secondary.main}
                tickFormatter={(value) => `₹${value / 1000}k`}
                label={{
                  value: "Revenue",
                  angle: 90,
                  position: "insideRight",
                  fill: theme.palette.text.secondary,
                  dy: -40,
                }}
              />
              <Tooltip content={<DailyTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="Patients"
                barSize={30}
                fill={theme.palette.primary.light}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Revenue"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyActivityChart;
