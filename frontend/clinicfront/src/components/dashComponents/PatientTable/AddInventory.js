import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Grid,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import { useNotification } from "../../../context/NotificationContext";

import api from "../../../api";

const AddInventory = ({ onAdded }) => {
  const [type, setType] = useState("medicine");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const { showNotification } = useNotification();

  const handleSubcategoryChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const addSubcategoryField = () => setSubcategories([...subcategories, ""]);
  const removeSubcategoryField = (index) => {
    const updated = [...subcategories];
    updated.splice(index, 1);
    setSubcategories(updated);
  };

  const handleSubmit = async () => {
    try {
      let url;
      let data;

      if (type === "medicine") {
        url = "/api/inventory/medicine";
        data = {
          name,
          quantity: Number(quantity),
          pricePerUnit: Number(price),
          lowStockThreshold: Number(lowStockThreshold),
        };
        showNotification("Medicine added succesfully", "success");
      } else if (type === "lab") {
        url = "/api/inventory/lab";
        data = { name };
        showNotification("Lab added succesfully", "success");
      }

      await api.post(url, data);
      onAdded();
    } catch (error) {
      console.error("Error adding item:", error);
      showNotification("Error adding item", "error");
    }
  };

  return (
    <Dialog open={true} onClose={onAdded}>
      <DialogTitle>Add Inventory</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            if (e.target.value !== "treatment") {
              setSubcategories([""]);
            }
          }}
          margin="normal"
        >
          <MenuItem value="medicine">Medicine</MenuItem>
          {/* <MenuItem value="treatment">Treatment</MenuItem> */}
          <MenuItem value="lab">Lab</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />

        {type === "medicine" && (
          <>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              margin="normal"
              fullWidth
            />
            <TextField
              fullWidth
              label="Price Per Unit (₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Low Stock Threshold"
              helperText="Show warning when quantity falls to this level."
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              margin="normal"
            />
          </>
        )}

        {/* {type === "treatment" && (
          <>
            <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
              Subcategories (e.g., Metal, Zirconia)
            </p>
            {subcategories.map((subcategory, index) => (
              <Grid container spacing={1} key={index} alignItems="center">
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    label={`Subcategory ${index + 1}`}
                    value={subcategory}
                    onChange={(e) =>
                      handleSubcategoryChange(index, e.target.value)
                    }
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => removeSubcategoryField(index)}
                    disabled={subcategories.length === 1}
                  >
                    <RemoveCircle />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              onClick={addSubcategoryField}
              startIcon={<AddCircle />}
              style={{ marginTop: "0.5rem" }}
            >
              Add Subcategory
            </Button>
          </>
        )} */}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          style={{ marginTop: "1.5rem" }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventory;
