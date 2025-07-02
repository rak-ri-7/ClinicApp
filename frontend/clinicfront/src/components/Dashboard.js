import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Grid,
} from "@mui/material";
import PatientsTable from "./dashComponents/PatientTable/PatientsTable";
import OverviewPanel from "./dashComponents/OverviewPanel/OverviewPanel";
import CalendarComponent from "./dashComponents/Calendar/Calendar";
import DailyActivityChart from "./dashComponents/DailyChart/DailyActivityChart";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ExcelImporter from "../utils/ImportExcel";
import { MedicinesContext } from "../context/MedicinesContext";

// Icons for the header
import logo from "../assets/logo.png";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { createContext } from "react";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [username, setUsername] = useState("");
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const { lowStockMedicines } = useContext(MedicinesContext);

  // State for the user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    // ... your data fetching logic is correct
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    api
      .get("/api/patients", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setPatients(response.data))
      .catch((error) => console.error("Error fetching patients:", error));

    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);
  }, [navigate, refresh]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null); // Close the menu first
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const fetchPatients = async () => {
    const response = await api.get("/api/patients");
    setPatients(response.data);
  };

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      {/* The new AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 90,
              height: 90,
              objectFit: "contain",
            }}
          />

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Dr. Swathi's Dental Care App
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar
                  sx={{ width: 34, height: 34, bgcolor: "primary.light" }}
                >
                  {username?.[0]?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* The User Menu that opens from the Avatar */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          {username.charAt(0).toUpperCase() + username.slice(1)}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Main Dashboard Content */}
      <Box component="main" sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={4}>
              <OverviewPanel />
            </Grid>
            <Grid item xs={12} lg={3}>
              <DailyActivityChart />
            </Grid>
            <Grid item xs={12} lg={5}>
              <CalendarComponent patients={patients} />
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Patient Repository
          </Typography>
          <ExcelImporter onImportSuccess={fetchPatients} />
        </Box>
        <PatientsTable key={refresh} />
      </Box>
    </Box>
  );
};

export default Dashboard;
