import { createContext, useState, useEffect } from "react";

export const ConsultationFeeContext = createContext();

export const ConsultationFeeProvider = ({ children }) => {
  const [consultationFee, setConsultationFee] = useState(() => {
    // Check localStorage for an existing consultation fee value
    const savedFee = localStorage.getItem("consultationFee");
    return savedFee ? savedFee : ""; // If there's no saved value, default to an empty string
  });

  // Log whenever the consultation fee changes
  useEffect(() => {
    console.log("Updated Consultation Fee in Context:", consultationFee);
    // Save the updated consultation fee to localStorage
    if (consultationFee) {
      localStorage.setItem("consultationFee", consultationFee);
    }
  }, [consultationFee]);

  return (
    <ConsultationFeeContext.Provider
      value={{ consultationFee, setConsultationFee }}
    >
      {children}
    </ConsultationFeeContext.Provider>
  );
};
