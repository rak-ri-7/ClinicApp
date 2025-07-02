import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const LabContext = createContext();

export const LabProvider = ({ children }) => {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await api.get("/api/inventory");
      console.log("Full API Response:", response.data); // Log the full response
      if (response.data.labs) {
        setLabs(response.data.labs); // Extract only labs
        console.log(response.data.labs);
      } else {
        console.error("Labs key not found in response");
      }
    } catch (error) {
      console.error("Error fetching labs:", error);
    }
  };

  useEffect(() => {
    console.log("Updated Labs in Context:", labs); // Log labs whenever it updates
  }, [labs]);

  return (
    <LabContext.Provider value={{ labs, setLabs, fetchLabs }}>
      {children}
    </LabContext.Provider>
  );
};
