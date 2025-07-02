import { createContext, useState, useEffect } from "react";

export const XrayFeeContext = createContext();

export const XrayFeeProvider = ({ children }) => {
  const [xrayFee, setXrayFee] = useState(() => {
    // Check localStorage for an existing consultation fee value
    const savedFee = localStorage.getItem("xrayFee");
    return savedFee ? savedFee : ""; // If there's no saved value, default to an empty string
  });

  // Log whenever the consultation fee changes
  useEffect(() => {
    console.log("Updated xray Fee in Context:", xrayFee);
    // Save the updated consultation fee to localStorage
    if (xrayFee) {
      localStorage.setItem("xrayFee", xrayFee);
    }
  }, [xrayFee]);

  return (
    <XrayFeeContext.Provider value={{ xrayFee, setXrayFee }}>
      {children}
    </XrayFeeContext.Provider>
  );
};
