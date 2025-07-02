import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import isDev from "electron-is-dev";
import fs from "fs";

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

// Error handlers
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  app.quit();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProd = !isDev;

let mainWindow = null;
let backendProcess = null;

// Configure userData early
if (isProd) {
  app.setPath("userData", path.join(app.getPath("appData"), "ClinicApp"));
}

function createWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  // Start backend
  function startBackend() {
    const serverPath = isProd
      ? path.join(
          process.resourcesPath,
          "app.asar.unpacked",
          "backend",
          "server.js"
        )
      : path.join(__dirname, "backend", "server.js");

    // Always use Node.js with explicit ES Modules flags
    backendProcess = spawn(
      "node",
      [serverPath],
      [
        "--experimental-modules", // For Node < 16
        "--no-warnings", // Suppress experimental warnings
        serverPath,
      ],
      {
        cwd: path.dirname(serverPath),
        env: {
          ...process.env,
          NODE_ENV: isProd ? "production" : "development",
          NODE_OPTIONS: "--experimental-modules --no-warnings", // Double enforcement
          PORT: 5000, // Explicitly set port
          NODE_ENV: isProd ? "production" : "development",
          MONGO_URI: process.env.MONGO_URI || "your-fallback-uri", // Add critical variables
          JWT_SECRET: process.env.JWT_SECRET || "your-secret",
        },
        stdio: "pipe",
        shell: false,
      }
    );
  }

  // Create main window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: false,
      partition: "persist:clinicapp", // Single session partition
    },
  });

  // Window lifecycle handlers
  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.on("closed", () => {
    if (backendProcess) {
      backendProcess.kill();
      backendProcess = null;
    }
    mainWindow = null;
  });

  // Load frontend
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    const filePath = path.join(
      process.resourcesPath,
      "react-build",
      "index.html"
    );
    const fileUrl = `file://${filePath.replace(/\\/g, "/")}`;

    mainWindow.loadURL(fileUrl).catch((err) => {
      console.error("Load error:", err);
      dialog.showErrorBox(
        "Application Error",
        `Failed to load application: ${err.message}`
      );
      app.quit();
    });
  }
}

// App event handlers
app.whenReady().then(() => {
  // Add GPU fallbacks
  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-software-rasterizer");
  app.commandLine.appendSwitch("disable-gpu-compositing");

  createWindow();
});

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
