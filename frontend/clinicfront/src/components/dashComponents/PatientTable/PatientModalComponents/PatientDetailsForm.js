import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";

const PatientDetailsForm = ({
  profileData,
  onProfileChange,
  activeVisit,
  onVisitChange,
  doctors,
  isPatient,
}) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Patient Details</Typography>
      <TextField
        name="name"
        label="Name"
        value={profileData.name || ""}
        onChange={onProfileChange}
        fullWidth
        disabled={isPatient}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          name="age"
          label="Age"
          type="number"
          value={profileData.age || ""}
          onChange={onProfileChange}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={profileData.gender || ""}
            label="Gender"
            onChange={onProfileChange}
          >
            <MenuItem value={"Male"}>Male</MenuItem>
            <MenuItem value={"Female"}>Female</MenuItem>
            <MenuItem value={"Other"}>Other</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <TextField
        name="phoneNumber"
        label="Phone Number"
        value={profileData.phoneNumber || ""}
        onChange={onProfileChange}
        fullWidth
      />
      <TextField
        name="address"
        label="Address"
        multiline
        rows={2}
        value={profileData.address || ""}
        onChange={onProfileChange}
        fullWidth
      />
      <TextField
        name="additionalInfo"
        label="Additional Info"
        multiline
        rows={2}
        value={profileData.additionalInfo || ""}
        onChange={onProfileChange}
        fullWidth
      />
      <TextField
        name="medicalHistory"
        label="Medical History"
        multiline
        rows={2}
        value={profileData.medicalHistory || ""}
        onChange={onProfileChange}
        fullWidth
      />
      <TextField
        name="dentalHistory"
        label="Dental History"
        multiline
        rows={2}
        value={profileData.dentalHistory || ""}
        onChange={onProfileChange}
        fullWidth
      />

      <Divider sx={{ my: 1 }} />
      <Typography variant="h6">Visit Details</Typography>
      <TextField
        name="date"
        label="Date"
        type="date"
        value={
          dayjs(activeVisit.date).isValid()
            ? dayjs(activeVisit.date).format("YYYY-MM-DD")
            : ""
        }
        onChange={onVisitChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Doctor</InputLabel>
        <Select
          name="doctor"
          value={activeVisit.doctor || ""}
          label="Doctor"
          onChange={onVisitChange}
          disabled={activeVisit.isDuesPayment}
        >
          {doctors.map((d) => (
            <MenuItem key={d._id} value={d.name}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        name="chiefComplaint"
        label="Chief Complaint"
        multiline
        rows={3}
        value={activeVisit.chiefComplaint || ""}
        onChange={onVisitChange}
        fullWidth
        disabled={activeVisit.isDuesPayment}
      />
      <TextField
        name="nextAppointment"
        label="Next Appointment Date"
        type="date"
        value={profileData.nextAppointment || ""}
        onChange={onProfileChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
    </Stack>
  );
};

export default PatientDetailsForm;
