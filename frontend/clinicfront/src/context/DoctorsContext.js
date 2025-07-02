// context/DoctorsContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api";

export const DoctorsContext = createContext();

export const DoctorsProvider = ({ children }) => {
  const injectSwathi = (doctorsList) => [
    {
      name: "Swathi Lakshmi",
      role: "Senior Dental Surgeon",
      specialization: "General Dentistry",
      experience: "12+ Years",
      percentageCut: "N/A",
    },
    ...doctorsList,
  ];

  const [doctors, setDoctors] = useState(() => injectSwathi([]));

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await api.get("/api/doctors");
      console.log("Full Doctors list:", response.data); // Log the full response
      setDoctors(injectSwathi(response.data));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <DoctorsContext.Provider
      value={{ doctors, setDoctors, injectSwathi, fetchDoctors }}
    >
      {children}
    </DoctorsContext.Provider>
  );
};
