const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// In production, load from unpacked resources folder
const isPackaged = process.mainModule?.filename.includes("app.asar");
const envPath = isPackaged
  ? path.join(process.resourcesPath, "backend", ".env")
  : path.join(__dirname, ".env");

dotenv.config({ path: envPath });

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your .env file.");
    }

    console.log("Connected to MongoDB at:", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
