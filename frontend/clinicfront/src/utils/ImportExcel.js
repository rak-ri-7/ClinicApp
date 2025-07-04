import React, { useRef, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../api";
import { useNotification } from "../context/NotificationContext";

const ImportExcel = ({ onImportSuccess }) => {
  const fileInputRef = useRef();
  const [isImporting, setIsImporting] = useState(false);
  const { showNotification } = useNotification();

  const handleFileSelect = () => {
    // Reset file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/upload/import/excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showNotification(res.data.message, "success");
      if (onImportSuccess) {
        onImportSuccess(); // Re-fetch table data
      }
    } catch (err) {
      console.error("Import error:", err);
      if (err.response && err.response.data) {
        const { message, errors } = err.response.data;
        const detailedMessage = (
          <div>
            <p>{message || "An error occurred."}</p>
            {errors && Array.isArray(errors) && (
              <ul style={{ paddingLeft: "20px", margin: "0" }}>
                {errors.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            {errors && errors.length > 5 && (
              <p>...and more errors (check backend console).</p>
            )}
          </div>
        );
        showNotification(detailedMessage, "error", 10000);

        // Case 2: A network error or CORS issue occurred (no response from server)
      } else if (err.request) {
        showNotification(
          "Could not connect to the server. Please check if the server is running and there are no CORS issues.",
          "error",
          8000
        );

        // Case 3: A different type of error occurred (e.g., problem setting up the request)
      } else {
        showNotification(
          `An unexpected error occurred: ${err.message}`,
          "error"
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx, .xls"
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <Button
        variant="outlined"
        startIcon={
          isImporting ? <CircularProgress size={20} /> : <UploadFileIcon />
        }
        onClick={handleFileSelect}
        disabled={isImporting}
      >
        {isImporting ? "Importing..." : "Import from Excel"}
      </Button>
    </>
  );
};

export default ImportExcel;
