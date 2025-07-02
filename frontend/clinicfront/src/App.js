import "./App.css";
import "./utils/axiosConfig.js";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Users from "./components/Users";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/dashComponents/PatientTable/Inventory.js";
import Doctors from "./components/dashComponents/PatientTable/Doctors";
import { MedicineProvider } from "./context/MedicinesContext";
import { TreatmentsProvider } from "./context/TreatmentsContext";
import { ConsultationFeeProvider } from "./context/ConsultationFeeContext";
import { LabProvider } from "./context/LabContext";
import { DoctorsProvider } from "./context/DoctorsContext";
import { PatientProvider } from "./context/PatientContext";
import { XrayFeeProvider } from "./context/XrayFeeContext.js";
import { NotificationProvider } from "./context/NotificationContext.js";

function App() {
  return (
    <div className="App">
      <Router>
        <NotificationProvider>
          {" "}
          <PatientProvider>
            <MedicineProvider>
              <TreatmentsProvider>
                <ConsultationFeeProvider>
                  <XrayFeeProvider>
                    <LabProvider>
                      <DoctorsProvider>
                        <Routes>
                          <Route path="/" element={<Login />} />
                          <Route path="/register" element={<Register />} />

                          <Route path="/dashboard" element={<Dashboard />} />

                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/doctors" element={<Doctors />} />
                        </Routes>
                      </DoctorsProvider>
                    </LabProvider>
                  </XrayFeeProvider>
                </ConsultationFeeProvider>
              </TreatmentsProvider>
            </MedicineProvider>
          </PatientProvider>
        </NotificationProvider>
      </Router>

      {/* <Users /> */}
    </div>
  );
}

export default App;
