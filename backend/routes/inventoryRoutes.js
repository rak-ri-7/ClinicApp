const express = require("express");
const Inventory = require("../models/inventoryModel");
const router = express.Router();

// 📌 GET Inventory (Fetch medicines, treatments and labs)
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.findOne();
    if (!inventory) {
      return res.status(404).json({ message: "No inventory found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

router.get("/labs", async (req, res) => {
  try {
    const inventory = await Inventory.findOne(); // Fetch the single inventory document
    if (!inventory) {
      return res.status(404).json({ message: "No inventory data found" });
    }
    res.json(inventory.labs); // Return only labs array
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lab items" });
  }
});

// 📌 POST Add Medicine
router.post("/medicine", async (req, res) => {
  try {
    const { name, quantity, pricePerUnit, lowStockThreshold } = req.body;

    let inventory = await Inventory.findOne();
    if (!inventory) {
      inventory = new Inventory({ medicines: [], treatments: [] });
    }

    const medicineExists = inventory.medicines.find((med) => med.name === name);
    if (medicineExists) {
      return res.status(400).json({ message: "Medicine already exists" });
    }

    inventory.medicines.push({
      name,
      quantity,
      pricePerUnit,
      lowStockThreshold,
    });
    await inventory.save();

    res.status(201).json({ message: "Medicine added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding medicine" });
  }
});

// 📌 POST Add Treatment
router.post("/treatment", async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    let inventory = await Inventory.findOne();
    if (!inventory) {
      inventory = new Inventory({ medicines: [], treatments: [] });
    }

    const treatmentExists = inventory.treatments.find(
      (treat) => treat.name === name
    );
    if (treatmentExists) {
      return res.status(400).json({ message: "Treatment already exists" });
    }

    inventory.treatments.push({ name, subcategories });
    await inventory.save();

    res.status(201).json({ message: "Treatment added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding treatment" });
  }
});

// 📌 POST Add Lab
router.post("/lab", async (req, res) => {
  try {
    const { name } = req.body;

    let inventory = await Inventory.findOne();
    if (!inventory) {
      inventory = new Inventory({ medicines: [], treatments: [], labs: [] });
    }

    const labExists = inventory.labs.find((lab) => lab.name === name);
    if (labExists) {
      return res.status(400).json({ message: "Lab already exists" });
    }

    inventory.labs.push({ name });
    await inventory.save();

    res.status(201).json({ message: "Lab added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding lab" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { name, quantityUsed } = req.body;
    console.log("🛠 Received Update Request:", { name, quantityUsed });

    if (!name || quantityUsed === undefined) {
      return res
        .status(400)
        .json({ message: "Name and quantityUsed are required" });
    }

    let inventory = await Inventory.findOne();
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    let medicine = inventory.medicines.find((med) => med.name === name);
    if (!medicine) {
      return res.status(404).json({ message: `Medicine '${name}' not found` });
    }

    if (medicine.quantity < quantityUsed) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    medicine.quantity = Math.max(0, medicine.quantity - quantityUsed);
    await inventory.save();

    console.log("✅ Inventory Updated Successfully:", medicine);

    res.json({
      message: "Inventory updated successfully",
      medicines: inventory.medicines,
    });
  } catch (error) {
    console.error("❌ Error updating inventory:", error);
    res.status(500).json({ message: "Error updating inventory", error });
  }
});

router.put("/updateDetails", async (req, res) => {
  try {
    const { id, quantity, pricePerUnit, lowStockThreshold } = req.body;
    let inventory = await Inventory.findOne();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    let medicine = inventory.medicines.find((med) => med._id.toString() === id);
    if (!medicine)
      return res.status(404).json({ message: "Medicine not found" });

    medicine.quantity = quantity;
    medicine.pricePerUnit = pricePerUnit;
    medicine.lowStockThreshold =
      lowStockThreshold ?? medicine.lowStockThreshold;

    await inventory.save();
    res.json({ message: "Inventory updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating inventory", error });
  }
});

router.delete("/medicine/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let inventory = await Inventory.findOne();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    inventory.medicines = inventory.medicines.filter(
      (med) => med._id.toString() !== id
    );
    await inventory.save();

    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting medicine", error });
  }
});

router.delete("/treatment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let inventory = await Inventory.findOne();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    inventory.treatments = inventory.treatments.filter(
      (treat) => treat._id.toString() !== id
    );
    await inventory.save();

    res.json({ message: "Treatment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting treatment", error });
  }
});

// 📌 DELETE Lab
router.delete("/lab/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let inventory = await Inventory.findOne();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    inventory.labs = inventory.labs.filter((lab) => lab._id.toString() !== id);
    await inventory.save();

    res.json({ message: "Lab deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lab", error });
  }
});

router.put("/updateTreatment", async (req, res) => {
  try {
    const { id, name, price } = req.body;
    let inventory = await Inventory.findOne();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    let treatment = inventory.treatments.find(
      (treat) => treat._id.toString() === id
    );
    if (!treatment)
      return res.status(404).json({ message: "Treatment not found" });

    treatment.name = name || treatment.name;
    treatment.price = price || treatment.price;

    await inventory.save();
    res.json({
      message: "Treatment updated successfully",
      treatments: inventory.treatments,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating treatment", error });
  }
});

// 📌 PUT Update Labs
router.put("/updateLab", async (req, res) => {
  try {
    const { id, name } = req.body;
    let inventory = await Inventory.findOne();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    let lab = inventory.labs.find((lab) => lab._id.toString() === id);
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    lab.name = name || lab.name;

    await inventory.save();
    res.json({
      message: "Lab updated successfully",
      labs: inventory.labs,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating treatment", error });
  }
});

module.exports = router;
