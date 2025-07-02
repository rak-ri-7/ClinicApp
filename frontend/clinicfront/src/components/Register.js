import React, { useState } from "react";
import api from "../api";

// Material-UI Imports for the Modal
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Typography,
  TextField,
  Paper,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Your Logo
import logo from "../assets/logo.png";

// Define the color palette to match the Login page
const colors = {
  background: "#F4F6F8",
  card: "#FFFFFF",
  primary: "#00a76f",
  primaryDark: "#007849",
  textPrimary: "#212B36",
  textSecondary: "#637381",
};

// Define the Slide transition
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// The Modal Component
const Register = ({ open, onClose }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/api/auth/register", { username, email, password });
      setSuccess("Registration successful! You can now close this and log in.");
      // Clear form after a short delay
      setTimeout(() => {
        setUsername("");
        setEmail("");
        setPassword("");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during registration."
      );
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setError("");
    setSuccess("");
    onClose(); // Call the parent's close handler
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      {/* 1. Header Bar with Close Button */}
      <AppBar sx={{ position: "relative", backgroundColor: colors.primary }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Create Your Account
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 2. Form Content */}
      <Box
        sx={{
          backgroundColor: colors.background,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
              <img src={logo} alt="Logo" style={{ width: 80, height: 80 }} />
              <Typography
                variant="h5"
                color={colors.textPrimary}
                fontWeight="bold"
              >
                Get Started
              </Typography>

              <Box
                component="form"
                onSubmit={handleRegister}
                sx={{ width: "100%" }}
              >
                <Stack spacing={2}>
                  {error && <Alert severity="error">{error}</Alert>}
                  {success && <Alert severity="success">{success}</Alert>}

                  <TextField
                    fullWidth
                    label="Full Name"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
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
                    disabled={!!success} // Disable button on success
                    sx={{
                      py: 1.5,
                      backgroundColor: colors.primary,
                      "&:hover": { backgroundColor: colors.primaryDark },
                      fontWeight: "bold",
                    }}
                  >
                    Register
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Dialog>
  );
};

export default Register;
