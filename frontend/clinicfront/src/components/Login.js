import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link as RouterLink } from "react-router-dom";

// Material-UI Imports
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";

// Your Logo
import logo from "../assets/logo.png";

// Import the new modal component
import Register from "./Register"; // Adjust path if needed

// Define our color palette
const colors = {
  background: "#F4F6F8",
  card: "#FFFFFF",
  primary: "#00a76f",
  primaryDark: "#007849",
  textPrimary: "#212B36",
  textSecondary: "#637381",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // === NEW STATE FOR THE MODAL ===
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    // ... (rest of the login logic is the same)
    try {
      const response = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <>
      {" "}
      {/* Use a Fragment to render the modal alongside the page */}
      <Box
        sx={{
          backgroundColor: colors.background,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              borderRadius: "16px",
              backgroundColor: colors.card,
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 95,
                  height: 95,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: colors.card,
                  mb: 2,
                  boxShadow: `-5px -5px 10px rgba(255, 255, 255, 0.9), 5px 5px 10px rgba(0, 0, 0, 0.1)`,
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{ width: 80, height: 80, objectFit: "contain" }}
                />
              </Box>

              <Stack spacing={1}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={colors.textPrimary}
                >
                  Welcome Back!
                </Typography>
                <Typography variant="body2" color={colors.textSecondary}>
                  Please enter your details to sign in.
                </Typography>
              </Stack>

              <Box
                component="form"
                onSubmit={handleLogin}
                sx={{ width: "100%" }}
              >
                {/* ... (rest of the form is the same) ... */}
                <Stack spacing={2}>
                  {error && <Alert severity="error">{error}</Alert>}
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{
                      py: 1.5,
                      backgroundColor: colors.primary,
                      color: "white",
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: "0 4px 14px 0 rgba(0, 167, 111, 0.38)",
                      "&:hover": {
                        backgroundColor: colors.primaryDark,
                        boxShadow: "none",
                      },
                    }}
                  >
                    Login
                  </Button>
                </Stack>
              </Box>

              <Typography variant="body2" color={colors.textSecondary}>
                Don't have an account?{" "}
                {/* === UPDATED LINK TO OPEN MODAL === */}
                <Link
                  component="button"
                  onClick={() => setOpenRegisterModal(true)}
                  underline="hover"
                  sx={{
                    color: colors.primary,
                    fontWeight: "bold",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
      {/* === RENDER THE MODAL HERE === */}
      <Register
        open={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
      />
    </>
  );
};

export default Login;
