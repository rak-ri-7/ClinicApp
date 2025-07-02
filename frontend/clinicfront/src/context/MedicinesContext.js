import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api";

export const MedicinesContext = createContext();

export const MedicineProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [totalMedicinesValue, setTotalMedicinesValue] = useState(0); // New state
  const [lowStockMedicines, setLowStockMedicines] = useState([]);

  const adjustLocalMedicineQuantity = useCallback((name, quantityUsed) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.name === name
          ? { ...med, quantity: med.quantity - quantityUsed }
          : med
      )
    );
  }, []);

  useEffect(() => {
    console.log("Medicines total value from modal", totalMedicinesValue);
    fetchMedicines(); // Ensure latest medicines when modal opens
  }, [totalMedicinesValue]);

  useEffect(() => {
    const lowStockItems = medicines.filter((med) => {
      const threshold = med.lowStockThreshold || 10;
      return med.quantity <= threshold;
    });
    setLowStockMedicines(lowStockItems);
  }, [medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get("/api/inventory"); // ✅ Fetch inventory
      console.log("Fetched Medicines:", response.data); // Debugging and found out there is indeed pricePerUnit in the medicines array
      setMedicines(response.data.medicines || []); // ✅ Extract medicines from inventory
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  const getMedicinePrice = useCallback(
    (name) => {
      const medicine = medicines.find((med) => med.name === name);
      return medicine ? medicine.pricePerUnit : null;
    },
    [medicines]
  ); // Add medicines dependency

  const addMedicine = async (newMedicine) => {
    try {
      const response = await api.post("/api/medicines", newMedicine);
      if (response.status === 201) fetchMedicines();
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  const deleteMedicine = async (id) => {
    try {
      await api.delete(`/api/medicines/${id}`);
      fetchMedicines();
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const updateMedicineQuantity = async (name, quantityUsed) => {
    console.log("🛠 Updating Medicine:", { name, quantityUsed });
    try {
      const response = await api.put("/api/inventory/update", {
        name,
        quantityUsed,
      });

      if (response.status === 200) fetchMedicines();
    } catch (error) {
      console.error("Error updating medicine quantity:", error);
    }
  };

  return (
    <MedicinesContext.Provider
      value={{
        medicines,
        setMedicines,
        fetchMedicines,
        addMedicine,
        deleteMedicine,
        updateMedicineQuantity,
        getMedicinePrice,
        totalMedicinesValue, // Expose total value
        setTotalMedicinesValue, // Expose setter
        adjustLocalMedicineQuantity,
        lowStockMedicines,
      }}
    >
      {children}
    </MedicinesContext.Provider>
  );
};
