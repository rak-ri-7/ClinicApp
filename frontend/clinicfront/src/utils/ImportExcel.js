import React, { useRef } from "react";
import { Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const ImportExcel = ({ onImportSuccess }) => {
  const fileInputRef = useRef();

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/import/excel", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Import failed");

      alert("Excel data imported!");
      onImportSuccess(); // e.g. re-fetch table data
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import Excel");
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx"
        onChange={handleImport}
        style={{ display: "none" }}
      />
      {/* <Button
        variant="outlined"
        startIcon={<UploadFileIcon />}
        onClick={() => fileInputRef.current.click()}
      >
        Import Excel
      </Button> */}
    </>
  );
};

export default ImportExcel;
