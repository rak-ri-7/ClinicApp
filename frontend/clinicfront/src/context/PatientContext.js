import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api"; // Make sure the path to your api instance is correct

// Create the context
export const PatientContext = createContext();

// Custom hook for using the context (no changes needed, but good to keep)
export const usePatientContext = () => useContext(PatientContext);

// Provider component (ENHANCED)
export const PatientProvider = ({ children }) => {
  // State for the entire list of patients for the table
  const [patients, setPatients] = useState([]);

  // State for the single patient currently being edited or viewed
  const [activePatient, setActivePatient] = useState(null);

  // --- ACTIONS ---

  // Action to fetch the entire list of patients (for the main table)
  const fetchAllPatients = async () => {
    try {
      const response = await api.get("/api/patients");
      setPatients(response.data);
      console.log("✅ All patients fetched and updated in context.");
    } catch (error) {
      console.error("Error fetching all patients:", error);
      setPatients([]);
    }
  };

  // Action to fetch a single, up-to-date patient record and set it as active.
  // This is the key to solving the stale data problem.
  const refreshActivePatient = async (patientId) => {
    if (!patientId) {
      setActivePatient(null);
      return;
    }
    try {
      console.log(`🔄 Refreshing data for patient ID: ${patientId}`);
      const response = await api.get(`/api/patients/${patientId}`);
      setActivePatient(response.data);
      console.log(
        "✅ Active patient data has been refreshed in context.",
        response.data
      );
    } catch (error) {
      console.error(`Error refreshing patient ${patientId}:`, error);
      setActivePatient(null);
    }
  };

  // This effect can be useful for initial load if needed, but we'll call it from the table.
  useEffect(() => {
    fetchAllPatients();
  }, []);

  // The value provided to all consuming components
  const value = {
    patients,
    activePatient,
    setActivePatient,
    fetchAllPatients,
    refreshActivePatient,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};
