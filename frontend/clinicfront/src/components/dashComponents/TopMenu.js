import React from "react";
import { Button, Typography, Toolbar } from "@mui/material";

const TopMenu = ({ username, handleLogout }) => {
  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h6">Welcome, {username}</Typography>
      <Button color="inherit" onClick={handleLogout}>
        Logout
      </Button>
    </Toolbar>
  );
};

export default TopMenu;
