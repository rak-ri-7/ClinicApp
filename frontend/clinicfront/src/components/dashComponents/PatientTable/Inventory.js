import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import "../../../App.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  Typography,
  IconButton,
  TextField,
  Grid2,
  Alert,
  AlertTitle,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddInventory from "./AddInventory";
import { MedicinesContext } from "../../../context/MedicinesContext";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { ConsultationFeeContext } from "../../../context/ConsultationFeeContext";
import CloseIcon from "@mui/icons-material/Close";
import { XrayFeeContext } from "../../../context/XrayFeeContext";

const Inventory = ({ onClose }) => {
  const { medicines, setMedicines, lowStockMedicines } =
    useContext(MedicinesContext);

  const { consultationFee, setConsultationFee } = useContext(
    ConsultationFeeContext
  );
  const { xrayFee, setXrayFee } = useContext(XrayFeeContext);
  const [feeInput, setFeeInput] = useState(consultationFee);
  const [xrayFeeInput, setXrayFeeInput] = useState(xrayFee);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [labItems, setLabItems] = useState([]);
  const navigate = useNavigate();
  const fetchInventory = useCallback(async () => {
    try {
      const response = await api.get("/api/inventory");
      setMedicines(response.data.medicines || []);

      setLabItems(response.data.labs || []); // Fetch lab items
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }, [setMedicines]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    setFeeInput(consultationFee);
  }, [consultationFee]);

  useEffect(() => {
    setXrayFeeInput(xrayFee);
  }, [xrayFee]);

  const handleAdded = async () => {
    setModalOpen(false);
    await fetchInventory();
  };
  const handleDelete = async (id, type) => {
    try {
      let url = "";

      if (type === "medicine") {
        url = `/api/inventory/medicine/${id}`;
      } else if (type === "lab") {
        url = `/api/inventory/lab/${id}`;
      }

      if (url) {
        await api.delete(url);
        fetchInventory(); // Refresh data after deletion
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // UPDATED: Removed 'treatment' as it's no longer editable
  const editableFields = {
    medicine: ["quantity", "pricePerUnit"],
  };

  const handleEdit = (item, type) => {
    setEditMode(item._id);
    setEditedData(
      editableFields[type].reduce((acc, field) => {
        acc[field] = item[field] ?? 0;
        return acc;
      }, {})
    );
  };

  const handleChange = (e, field) => {
    setEditedData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFeeChange = (e) => {
    setFeeInput(e.target.value);
  };

  const handleXFeeCHange = (e) => {
    setXrayFeeInput(e.target.value);
  };

  const handleUpdateFee = () => {
    setConsultationFee(feeInput);
  };

  const handleUpdateXrayFee = () => {
    setXrayFee(xrayFeeInput);
  };

  // UPDATED: Simplified to only handle saving for 'medicine'
  const handleSave = async (id, type) => {
    try {
      if (type === "medicine") {
        const updatedData = {
          id,
          quantity: Number(editedData.quantity),
          pricePerUnit: Number(editedData.pricePerUnit),
        };
        await api.put("/api/inventory/updateDetails", updatedData);
      } else {
        console.error("Attempted to save an un-editable type:", type);
        return;
      }
      setEditMode(null);
      await fetchInventory();
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Inventory Management</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>

      {lowStockMedicines.length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
          {" "}
          <AlertTitle>Low Stock Warning</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            The following items are running low and may need to be reordered:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {lowStockMedicines.map((med) => (
              <Chip
                key={med._id}
                label={`${med.name} (Qty: ${med.quantity})`}
                color="warning"
                variant="outlined"
              />
            ))}
          </Stack>
        </Alert>
      )}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" spacing={2}>
          <TextField
            label="Consultation Fee"
            value={feeInput}
            onChange={handleFeeChange}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateFee}
            style={{ marginLeft: "10px" }}
          >
            Update
          </Button>
          <TextField
            label="X Ray Fee"
            value={xrayFeeInput}
            onChange={handleXFeeCHange}
            variant="outlined"
            style={{ marginLeft: "10px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateXrayFee}
            style={{ marginLeft: "10px" }}
          >
            Update
          </Button>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setModalOpen(true)}
        >
          + Add Inventory Item
        </Button>
      </Stack>

      {/* <Button
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
      </Button> */}

      {/* Medicines Table */}
      <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2 }}>
        All Medicines
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: 300, overflowY: "auto" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Quantity</b>
              </TableCell>
              <TableCell>
                <b>Price per Unit (₹)</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicines.length > 0 ? (
              medicines.map((medicine) => (
                <TableRow key={medicine._id}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>
                    {editMode === medicine._id ? (
                      <TextField
                        type="number"
                        value={editedData.quantity}
                        onChange={(e) => handleChange(e, "quantity")}
                        size="small"
                      />
                    ) : (
                      medicine.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode === medicine._id ? (
                      <TextField
                        type="number"
                        value={editedData.pricePerUnit}
                        onChange={(e) => handleChange(e, "pricePerUnit")}
                        size="small"
                      />
                    ) : (
                      `₹${medicine.pricePerUnit}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode === medicine._id ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSave(medicine._id, "medicine")}
                      >
                        Save
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => handleEdit(medicine, "medicine")}
                        >
                          Edit
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(medicine._id, "medicine")}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No medicines available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid2 container spacing={2}>
        <Grid2 item sx={{ flex: 1 }}>
          {/* Lab Table */}
          <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 4 }}>
            Labs
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 300, overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labItems.length > 0 ? (
                  labItems.map((lab) => (
                    <TableRow key={lab._id}>
                      <TableCell>{lab.name}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(lab._id, "lab")}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No lab items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid2>
      </Grid2>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <AddInventory onAdded={handleAdded} />
      </Dialog>
    </div>
  );
};

export default Inventory;
