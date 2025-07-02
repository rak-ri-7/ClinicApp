import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid2,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddDoctor from "./AddDoctor.js";
import api from "../../../api.js";
import { DoctorsContext } from "../../../context/DoctorsContext.js";
import CloseIcon from "@mui/icons-material/Close";

const Doctors = ({ onClose }) => {
  console.log("Doctors rendered"); // Should log in DevTools
  const navigate = useNavigate();

  // Default doctor list
  const { doctors, setDoctors, injectSwathi, fetchDoctors } =
    useContext(DoctorsContext); // ✅ Access from context
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    percentageCut: 70,
    additionalInfo: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "percentageCut" ? parseInt(value, 10) : value,
    }));
  };

  const handleEditDoctor = (doctor) => {
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      percentageCut: doctor.percentageCut,
      additionalInfo: doctor.additionalInfo || "70%",
    });
    setEditingDoctor(doctor); // set doctor being edited
    setAddModalOpen(true);
  };

  const handleAddDoctor = async () => {
    try {
      if (editingDoctor) {
        // Edit existing
        await api.put(`/api/doctors/${editingDoctor._id}`, formData);
      } else {
        // Add new
        await api.post("/api/doctors", formData);
      }

      setAddModalOpen(false);
      setFormData({
        name: "",
        specialization: "",
        experience: "",
        percentageCut: 70,
        additionalInfo: "",
      });
      await fetchDoctors(); // refresh
    } catch (error) {
      console.error("Error adding doctor", error);
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      await api.delete(`/api/doctors/${id}`);

      // Fetch updated doctors list first
      const response = await api.get("/api/doctors");
      const fetchedDoctors = Array.isArray(response.data) ? response.data : [];

      const updatedDoctors = injectSwathi(fetchedDoctors);
      setDoctors(updatedDoctors);

      // Adjust activeTab if current index is out of range
      if (activeTab >= updatedDoctors.length) {
        setActiveTab(updatedDoctors.length - 1);
      }
    } catch (error) {
      console.log("Error deleting doctor", error);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        Doctors Panel
      </Typography>

      <Button
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: "white",
          borderRadius: "50%",
          minWidth: "40px",
          height: "40px",
          boxShadow: 2,
          "&:hover": {
            backgroundColor: "#eee",
          },
        }}
      >
        <CloseIcon />
      </Button>

      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 3,
          p: 2,
          mb: 4,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          {doctors.map((doctor, index) => (
            <Tab key={index} label={`Dr. ${doctor.name}`} />
          ))}
        </Tabs>

        {doctors.map((doctor, index) => (
          <Box
            role="tabpanel"
            hidden={activeTab !== index}
            key={index}
            sx={{ mt: 2 }}
          >
            {activeTab === index && (
              <Accordion defaultExpanded sx={{ boxShadow: 2, borderRadius: 1 }}>
                <AccordionDetails>
                  <Box sx={{ mt: 2 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditDoctor(doctor)}
                        sx={{ mr: 2 }}
                      >
                        Edit
                      </Button>
                      {doctor.role !== "Senior Dental Surgeon" && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteDoctor(doctor._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 4,
                      mt: 3,
                    }}
                  >
                    {/* Column 1 */}
                    <Box sx={{ flex: 1 }}>
                      <Box mb={2}>
                        <Typography>
                          <strong>Role:</strong> {doctor.role}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography>
                          <strong>Specialization:</strong>{" "}
                          {doctor.specialization}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography>
                          <strong>Experience:</strong> {doctor.experience}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Column 2 */}
                    <Box sx={{ flex: 1 }}>
                      <Box mb={2}>
                        <Typography>
                          <strong>Percentage Cut:</strong>{" "}
                          {doctor.percentageCut}%
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography>
                          <strong>Additional Info:</strong>{" "}
                          {doctor.additionalInfo || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ textAlign: "right" }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingDoctor(null);
            setFormData({
              name: "",
              specialization: "",
              experience: "",
              percentageCut: 70,
            });
            setAddModalOpen(true);
          }}
        >
          Add Doctor
        </Button>
      </Box>

      <AddDoctor
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleAddDoctor}
        isEdit={!!editingDoctor}
      />
    </Box>
  );
};

export default Doctors;
