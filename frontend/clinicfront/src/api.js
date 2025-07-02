import axios from "axios";

// Determine environment
const isElectron = window && window.process && window.process.type;
const isProduction = process.env.NODE_ENV === "production";

// Set base URL based on environment
let API_BASE = "";

if (isProduction && isElectron) {
  // In packaged Electron app - relative paths
  API_BASE = "";
} else {
  // Development
  API_BASE = "http://localhost:5000";
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
