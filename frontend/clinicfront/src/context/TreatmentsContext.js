import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const TreatmentsContext = createContext();

export const TreatmentsProvider = ({ children }) => {
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await api.get("/api/inventory");
      setTreatments(response.data.treatments || []);
    } catch (error) {
      console.error("Error fetching treatments:", error);
    }
  };

  const addTreatment = async (newTreatment) => {
    try {
      await api.post("/api/inventory/treatment", newTreatment);
      fetchTreatments();
    } catch (error) {
      console.error("Error adding treatment:", error);
    }
  };

  const updateTreatment = async (id, updatedData) => {
    try {
      await api.put("/api/inventory/updateTreatment", {
        id,
        price: Number(updatedData.price),
      });
      fetchTreatments();
    } catch (error) {
      console.error("Error updating treatment:", error);
    }
  };

  const deleteTreatment = async (id) => {
    try {
      await api.delete(`/api/inventory/treatment/${id}`);
      fetchTreatments();
    } catch (error) {
      console.error("Error deleting treatment:", error);
    }
  };

  return (
    <TreatmentsContext.Provider
      value={{
        treatments,
        setTreatments,
        addTreatment,
        updateTreatment,
        deleteTreatment,
      }}
    >
      {children}
    </TreatmentsContext.Provider>
  );
};
