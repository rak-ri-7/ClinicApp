const express = require("express");
const userModel = require("../models/userModel");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await userModel.find({});
    console.log("Fetched Users:", users); // Debugging output
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update user details
router.put("/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
