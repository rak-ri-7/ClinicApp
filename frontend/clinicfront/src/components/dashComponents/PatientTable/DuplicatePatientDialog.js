// src/components/patient/DuplicatePatientDialog.js

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const DuplicatePatientDialog = ({
  open,
  duplicates,
  onConfirmNew,
  onClose,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Potential Duplicate Patient Found</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          The following patient(s) with a similar name already exist in the
          database. Please review them to avoid creating a duplicate record.
        </Typography>
        <List sx={{ border: "1px solid #ddd", borderRadius: "4px", mt: 2 }}>
          {duplicates.map((p, index) => (
            <React.Fragment key={p._id}>
              <ListItem>
                <ListItemText
                  primary={<Typography variant="h6">{p.name}</Typography>}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Age: {p.age || "N/A"}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Phone: {p.phoneNumber || "N/A"}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Address: {p.address || "N/A"}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < duplicates.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          It's One of These (Cancel)
        </Button>
        <Button onClick={onConfirmNew} variant="contained" color="primary">
          Yes, This is a New Patient
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicatePatientDialog;
