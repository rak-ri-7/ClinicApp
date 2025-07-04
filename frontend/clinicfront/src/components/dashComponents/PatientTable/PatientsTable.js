import React, { useState, useEffect, useMemo } from "react";
import api from "../../../api";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  TablePagination,
  TextField,
  Tooltip,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import {
  PersonAdd,
  Visibility,
  Edit,
  Delete,
  MedicalServices,
  Inventory2,
  Troubleshoot,
  FileDownload,
} from "@mui/icons-material";
import PatientModal from "./PatientModal";
import PatientHistory from "./PatientHistory";
import Doctors from "./Doctors";
import Inventory from "./Inventory";
import DentalChartModal from "./DentalChartModal";
import { usePatientContext } from "../../../context/PatientContext";
import truncateWords from "../../../utils/truncateWords";
import dayjs from "dayjs";
import { formatEarnings } from "../../../utils/formatters";
import PatientActions from "./PatientActions";

// --- Components & Styles (No changes needed here) ---

const TableToolbar = ({
  onSearch,
  onAddNew,
  onExport,
  onDoctors,
  onInventory,
  onImportSuccess,
}) => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 2,
    }}
  >
    <TextField
      label="Search Patients..."
      variant="outlined"
      size="small"
      onChange={(e) => onSearch(e.target.value)}
      sx={{ minWidth: "300px", flexGrow: 1 }}
    />
    <Stack direction="row" spacing={1.5}>
      <PatientActions onImportSuccess={onImportSuccess} />
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<Inventory2 />}
        onClick={onInventory}
      >
        Inventory
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<MedicalServices />}
        onClick={onDoctors}
      >
        Doctors
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAdd />}
        onClick={onAddNew}
      >
        Add Patient
      </Button>
    </Stack>
  </Box>
);

const headerCellStyles = {
  fontWeight: "bold",
  color: "text.primary",
  backgroundColor: (theme) => theme.palette.grey[100],
  borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
};

// --- Main Table Component ---

const PatientsTable = () => {
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [doctorsModalOpen, setDoctorsModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartPatient, setChartPatient] = useState(null);

  const WORD_LIMIT = 5;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/api/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleRefreshData = () => {
    // The function that re-fetches all patients to update the table
    fetchPatients();
  };

  const handleExcelExport = async () => {
    try {
      const response = await api.get("/api/export/excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let filename = "patients.xlsx";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch.length === 2) filename = fileNameMatch[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting excel", err);
    }
  };

  const filteredPatients = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (!lowerCaseQuery) {
      return patients;
    }
    return patients.filter((patient) => {
      const latestVisit =
        patient.visitHistory?.[patient.visitHistory.length - 1];
      const searchableText = [
        patient.name,
        patient.phoneNumber,
        latestVisit?.doctor,
        latestVisit?.chiefComplaint,
        ...(latestVisit?.treatments?.map((t) => t.name) || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(lowerCaseQuery);
    });
  }, [patients, searchQuery]);

  // ===================================================================
  //  ** THE CRITICAL FIX IS HERE **
  //  We no longer use .reduce() on totalCharge. We simply take the
  //  totalCharge from the latest visit, as it's already cumulative.
  // ===================================================================
  // In frontend/src/components/Patients/PatientsTable.js

  const patientsToDisplay = useMemo(() => {
    // Create a mutable copy of the filtered patients to sort.
    const sortedPatients = [...filteredPatients];

    // Perform the definitive two-level sort.
    sortedPatients.sort((a, b) => {
      const lastVisitA = a.visitHistory?.[a.visitHistory.length - 1];
      const lastVisitB = b.visitHistory?.[b.visitHistory.length - 1];

      // Rule: Patients with no visits are always pushed to the bottom.
      if (!lastVisitA) return 1;
      if (!lastVisitB) return -1;

      // --- PRIMARY SORT: By the actual visit date (most recent day first) ---
      const dateA = new Date(lastVisitA.date);
      const dateB = new Date(lastVisitB.date);
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB - dateA;
      }

      // --- SECONDARY (TIE-BREAKER) SORT: By the Visit's own _id ---
      // This is now guaranteed to exist and is naturally chronological.
      // A visit created later will have a "greater" _id string.
      // We use localeCompare for safe string comparison. Descending order is b vs a.
      return lastVisitB._id.localeCompare(lastVisitA._id);
    });

    // Slice the perfectly sorted list for the current page.
    const paginatedPatients = sortedPatients.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    // Map only the paginated items to the display format.
    return paginatedPatients.map((patient) => {
      const latestVisit =
        patient.visitHistory?.[patient.visitHistory.length - 1] || {};

      // All your existing mapping logic is correct and stays here.
      const totalPaid =
        (patient.duesPaidHistory?.reduce((acc, due) => acc + due.amount, 0) ||
          0) +
        (patient.visitHistory?.reduce(
          (acc, visit) => acc + (visit.paidAmount || 0),
          0
        ) || 0);
      const totalLabCharges =
        patient.visitHistory?.reduce(
          (acc, visit) => acc + (visit.labCharge || 0),
          0
        ) || 0;
      const totalSpecialistFees =
        patient.visitHistory?.reduce(
          (acc, visit) => acc + (visit.specialistFee || 0),
          0
        ) || 0;
      const calculatedTotalEarnings =
        totalPaid - totalLabCharges - totalSpecialistFees;
      const calculatedPendingAmount =
        (latestVisit.totalCharge || 0) - totalPaid;

      return {
        _id: patient._id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        nextAppointment: patient.nextAppointment,
        isDuesPayment: latestVisit.isDuesPayment || false,
        doctor: latestVisit.doctor || "N/A",
        date: latestVisit.date,
        chiefComplaint: latestVisit.chiefComplaint || "N/A",
        treatments: latestVisit.treatments || [],
        paymentMode: latestVisit.paymentMode,
        totalCharge: latestVisit.totalCharge || 0,
        paidAmount: totalPaid,
        pendingAmount: calculatedPendingAmount,
        totalEarnings: calculatedTotalEarnings,
      };
    });
  }, [filteredPatients, page, rowsPerPage]);

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this patient record?")
    ) {
      try {
        await api.delete(`/api/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
      }
    }
  };

  const handleHistoryClick = (patient) => {
    setHistoryPatient(patient);
    setHistoryModalOpen(true);
  };

  const handleOralExamClick = (patient) => {
    setChartPatient(patient);
    setChartModalOpen(true);
  };

  return (
    <Paper elevation={3} sx={{ margin: "auto", overflow: "hidden" }}>
      <TableToolbar
        onSearch={handleSearchChange}
        onAddNew={() => {
          setEditingPatient(null);
          setModalOpen(true);
        }}
        onExport={handleExcelExport}
        onDoctors={() => setDoctorsModalOpen(true)}
        onInventory={() => setInventoryModalOpen(true)}
        onImportSuccess={handleRefreshData}
      />
      <TableContainer>
        <Table aria-label="professional patients table">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyles}>Patient Name</TableCell>
              <TableCell sx={headerCellStyles}>Assigned Doctor</TableCell>
              <TableCell sx={headerCellStyles}>Last Visit</TableCell>
              <TableCell sx={headerCellStyles}>Next Appointment</TableCell>
              <TableCell sx={headerCellStyles}>Chief Complaint</TableCell>
              <TableCell sx={headerCellStyles}>Treatments Done</TableCell>
              <TableCell sx={headerCellStyles} align="right">
                Total Charge (₹)
              </TableCell>
              <TableCell sx={headerCellStyles} align="right">
                Paid Amount (₹)
              </TableCell>
              <TableCell sx={headerCellStyles} align="right">
                Pending (₹)
              </TableCell>
              <TableCell sx={headerCellStyles} align="right">
                Total Earnings (₹)
              </TableCell>
              <TableCell sx={headerCellStyles} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patientsToDisplay.map((row) => (
              <TableRow
                key={row._id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:nth-of-type(odd)": {
                    backgroundColor: (theme) => theme.palette.action.hover,
                  },
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.action.selected,
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body1" fontWeight="medium">
                    {row.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.age} / {row.gender?.[0]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<MedicalServices fontSize="small" />}
                    label={row.doctor === "N/A" ? "N/A" : `Dr.${row.doctor}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  {row.date ? dayjs(row.date).format("DD MMM, YYYY") : "N/A"}
                </TableCell>
                <TableCell>
                  {row.nextAppointment ? (
                    <Chip
                      label={dayjs(row.nextAppointment).format("DD MMM, YYYY")}
                      color="warning"
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title={row.chiefComplaint}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ maxWidth: "200px" }}
                    >
                      {truncateWords(row.chiefComplaint, WORD_LIMIT) || "N/A"}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ minWidth: 180 }}>
                  {(() => {
                    if (row.isDuesPayment) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          N/A (Dues Payment)
                        </Typography>
                      );
                    }
                    const treatmentNames =
                      row.treatments?.map((t) => t.name) || [];
                    if (treatmentNames.length === 0) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          For Consultation
                        </Typography>
                      );
                    }
                    const CHIP_LIMIT = 1;
                    const displayedTreatments = treatmentNames.slice(
                      0,
                      CHIP_LIMIT
                    );
                    const remainingCount =
                      treatmentNames.length - displayedTreatments.length;
                    const tooltipContent = (
                      <div>
                        <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                          All Treatments:
                        </Typography>
                        {treatmentNames.map((name, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            component="div"
                          >
                            • {name}
                          </Typography>
                        ))}
                      </div>
                    );
                    return (
                      <Tooltip title={tooltipContent} arrow>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          {displayedTreatments.map((name, index) => (
                            <Chip
                              key={index}
                              label={name}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          ))}
                          {remainingCount > 0 && (
                            <Chip label={`+${remainingCount}`} size="small" />
                          )}
                        </Stack>
                      </Tooltip>
                    );
                  })()}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {typeof row.totalCharge === "number"
                      ? row.totalCharge.toFixed(2)
                      : "N/A"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color={row.paidAmount > 0 ? "success.main" : "text.primary"}
                  >
                    {row.paidAmount?.toFixed(2) || "0.00"}
                  </Typography>
                </TableCell>
                {/* I also added a Pending Amount column for clarity */}
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={
                      row.pendingAmount > 0 ? "error.main" : "success.main"
                    }
                  >
                    {row.pendingAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack alignItems="flex-end">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        row.totalEarnings >= 0 ? "success.main" : "error.main"
                      }
                    >
                      {formatEarnings(row.totalEarnings).main}
                    </Typography>
                    {row.totalEarnings < 0 && (
                      <Typography
                        variant="caption"
                        color="error.main"
                        sx={{ fontStyle: "italic" }}
                      >
                        {formatEarnings(row.totalEarnings).detail}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="View Patient History">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleHistoryClick(
                            patients.find((p) => p._id === row._id)
                          )
                        }
                      >
                        <Visibility color="action" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Oral Examination Chart">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleOralExamClick(
                            patients.find((p) => p._id === row._id)
                          )
                        }
                      >
                        <Troubleshoot color="info" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Patient Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleEditClick(
                            patients.find((p) => p._id === row._id)
                          )
                        }
                      >
                        <Edit color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Patient">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(row._id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* --- Modals (no changes needed) --- */}
      {modalOpen && (
        <PatientModal
          patient={editingPatient}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdated={() => {
            setModalOpen(false);
            fetchPatients();
          }}
        />
      )}
      {historyModalOpen && (
        <PatientHistory
          open={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          patient={historyPatient}
        />
      )}
      <Dialog
        open={doctorsModalOpen}
        onClose={() => setDoctorsModalOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <Doctors onClose={() => setDoctorsModalOpen(false)} />
      </Dialog>
      <Dialog
        open={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <Inventory onClose={() => setInventoryModalOpen(false)} />
      </Dialog>
      {chartModalOpen && (
        <DentalChartModal
          open={chartModalOpen}
          patient={chartPatient}
          onClose={() => setChartModalOpen(false)}
          onUpdated={() => {
            setChartModalOpen(false);
            fetchPatients();
          }}
        />
      )}
    </Paper>
  );
};

export default PatientsTable;
