import React, { useState, useMemo, useRef } from "react";
import Calendar from "react-calendar";
import {
  Box,
  Modal,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Stack,
  styled,
  IconButton,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs from "dayjs";
import { CalendarWrapper } from "./CalendarWrapper";

// The CalendarWrapper component does not need to be changed.

// The Hover-Activated Slider Component
const UpcomingAppointmentsSlider = ({ upcomingList }) => {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: "bold",
          color: "text.secondary",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.60rem",
          padding: "5px 10px",
          mr: 1.5,
        }}
      >
        <div>Upcoming</div> Apptmnts
      </Typography>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          "&:hover .slider-arrow": { opacity: 1 },
        }}
      >
        <IconButton
          onClick={() => handleScroll("left")}
          className="slider-arrow"
          sx={{
            position: "absolute",
            left: -10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.7)",
            opacity: 0,
            transition: "opacity 0.3s",
            "&:hover": { bgcolor: "white" },
          }}
          size="small"
        >
          <ArrowBackIosNewIcon fontSize="inherit" />
        </IconButton>

        <IconButton
          onClick={() => handleScroll("right")}
          className="slider-arrow"
          sx={{
            position: "absolute",
            right: -10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.7)",
            opacity: 0,
            transition: "opacity 0.3s",
            "&:hover": { bgcolor: "white" },
          }}
          size="small"
        >
          <ArrowForwardIosIcon fontSize="inherit" />
        </IconButton>

        <Stack
          ref={scrollContainerRef}
          direction="row"
          spacing={1.5}
          sx={{
            overflowX: "auto",
            scrollBehavior: "smooth",
            py: "4px",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {upcomingList.length > 0 ? (
            upcomingList.map((appt, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: "4px 8px",
                  borderRadius: 2,
                  minWidth: "150px",
                  borderColor: "grey.300",
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    mr: 1.5,
                    borderRight: 1,
                    borderColor: "divider",
                    pr: 1.5,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, lineHeight: 1.1 }}
                  >
                    {appt.date.format("D")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {appt.date.format("MMM")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={appt.name}
                >
                  {appt.name}
                </Typography>
              </Paper>
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "48px",
                pl: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No upcoming appointments.
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

// --- The Main Calendar Component ---
const CalendarComponent = ({ patients = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const { appointmentSet, upcomingList } = useMemo(() => {
    const set = new Set();
    const list = [];
    patients.forEach((p) => {
      if (p?.nextAppointment) {
        const date = dayjs(p.nextAppointment);
        set.add(date.format("YYYY-MM-DD"));
        if (date.isAfter(dayjs().subtract(1, "day"))) {
          list.push({ date: date, name: p.name });
        }
      }
    });
    list.sort((a, b) => a.date - b.date);
    return { appointmentSet: set, upcomingList: list };
  }, [patients]);

  // --- THIS FUNCTION IS NOW FULLY RESTORED ---
  const handleDateClick = (date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    if (appointmentSet.has(formattedDate)) {
      const matchingPatients = patients
        .filter(
          (p) => dayjs(p.nextAppointment).format("YYYY-MM-DD") === formattedDate
        )
        .map((p) => p.name);

      setSelectedPatients(matchingPatients);
      setSelectedDate(date);
      setModalOpen(true);
    }
  };

  // --- THIS FUNCTION IS ALSO FULLY RESTORED ---
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      if (appointmentSet.has(formattedDate)) {
        return <Box className="appointment-dot" />;
      }
    }
    return null;
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 3, height: "100%" }}>
      <CardHeader
        title="Appointments Calendar"
        sx={{
          "& .MuiCardHeader-title": { fontWeight: "bold", fontSize: "medium" },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <CalendarWrapper>
          <Calendar
            onClickDay={handleDateClick}
            value={selectedDate}
            tileContent={tileContent}
          />
        </CalendarWrapper>
        <Divider sx={{ my: 2 }} />
        <UpcomingAppointmentsSlider upcomingList={upcomingList} />
      </CardContent>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 350 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
            Appointments On
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
          </Typography>
          <List sx={{ mt: 2 }}>
            {selectedPatients.map((name, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <EventIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </Card>
  );
};

export default CalendarComponent;
