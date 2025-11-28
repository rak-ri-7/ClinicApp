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

// --- 1. Centralized CORS Configuration (THE FIX IS HERE) ---
const whitelist = ["http://localhost:3000"]; // Your web app's origin
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    // and requests from the whitelist.
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions)); // Use the CORS middleware ONCE, right at the top.

// --- 2. Body Parser Middleware (MUST come AFTER CORS) ---
app.use(express.json());

// --- 3. API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/upload", uploadRoutes);

// --- 4. Start the Server ---
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
