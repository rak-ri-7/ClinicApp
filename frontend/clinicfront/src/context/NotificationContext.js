import React, { createContext, useState, useContext, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

const NotificationContext = createContext(null); // Initialize with null for better error checking

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const showNotification = useCallback((message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const value = { showNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {/*
          THE FIX: Add a conditional check. 
          Only render the Alert if the Snackbar is actually supposed to be open.
          This prevents any possibility of trying to style an undefined element.
        */}
        {notification.open ? (
          <Alert
            onClose={handleClose}
            severity={notification.severity}
            sx={{ width: "100%" }}
            variant="filled" // Use filled variant for better visibility
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    // Check against null
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
