const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Import database and routes
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const exportRoutes = require("./routes/exportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// --- 1. Centralized CORS Configuration (The Fix) ---
// We define the options once and use them once.
// This is the single source of truth for your CORS policy.
const corsOptions = {
  origin: "http://localhost:3000", // The address of your React app
  credentials: true, // Allows cookies and authorization headers to be sent
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use the CORS middleware ONCE, right at the top.

// --- 2. Body Parser Middleware (MUST come AFTER CORS) ---
// This is essential for your backend to read JSON bodies from requests.
app.use(express.json());

// --- 3. API Routes ---
// Grouping related routes under a common, specific base path is good practice.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/doctors", doctorRoutes);

// --- 4. Specific Routes for Import/Export (The Fix) ---
// This avoids conflicts and makes the URLs in your frontend more logical.
app.use("/api/export", exportRoutes); // All routes in exportRoutes will be prefixed with /api/export
app.use("/api/upload", uploadRoutes); // All routes in uploadRoutes will be prefixed with /api/upload

// --- 5. Start the Server ---
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to connect to DB, server not started.");
    process.exit(1);
  }
};

startServer();
