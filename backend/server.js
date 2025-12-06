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

// ==========================================
// 1. CORS MUST BE THE FIRST MIDDLEWARE
// ==========================================
// origin: true -> Automatically reflects the requesting origin (e.g. http://localhost)
// credentials: true -> Allows cookies/tokens
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Your web frontend
      "http://localhost", // 👈 IMPORTANT: Capacitor Android Webview origin
      "http://10.0.2.2:5000", // Optional: Emulator requests
      "capacitor://localhost", // iOS origin (if you build for iOS later)
    ],
    credentials: true,
  })
);

// ==========================================
// 2. Body Parser (AFTER CORS)
// ==========================================
app.use(express.json());

// ==========================================
// 3. API Routes
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/upload", uploadRoutes);

// ==========================================
// 4. Start Server
// ==========================================
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    // Listen on 0.0.0.0 to ensure external access works (just in case)
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to connect to DB, server not started.");
    process.exit(1);
  }
};

startServer();
