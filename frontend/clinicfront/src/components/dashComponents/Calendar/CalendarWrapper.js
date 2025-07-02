import { Box, styled } from "@mui/material";

export const CalendarWrapper = styled(Box)(({ theme }) => ({
  ".react-calendar": {
    width: "100%",
    border: "none",
    fontFamily: theme.typography.fontFamily,
    backgroundColor: "transparent",
  },
  ".react-calendar__navigation button": {
    minWidth: "40px",
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderRadius: "50%",
    },
  },
  ".react-calendar__navigation button:disabled": {
    color: theme.palette.text.disabled,
  },
  ".react-calendar__navigation__label": {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    fontSize: "1rem",
  },
  ".react-calendar__month-view__weekdays": { display: "flex" },
  ".react-calendar__month-view__weekdays__weekday": {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    textTransform: "abbr",
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: "none",
    padding: "0.5em",
  },
  ".react-calendar__month-view__days": {
    display: "flex",
    flexDirection: "column",
    height: "288px",
  },
  ".react-calendar__month-view__days > div": { display: "flex", flex: 1 },
  ".react-calendar__tile": {
    flex: 1,
    minWidth: 0,
    height: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    background: "none",
    border: "none",
    borderRadius: "50%",
  },
  ".react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus": {
    backgroundColor: theme.palette.action.hover,
  },
  ".react-calendar__tile--active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": { backgroundColor: theme.palette.primary.dark },
  },
  ".react-calendar__tile--now": {
    background: theme.palette.action.selected,
    fontWeight: "bold",
  },
  ".appointment-dot": {
    height: "6px",
    width: "18px",
    backgroundColor: theme.palette.secondary.main,
    borderRadius: "30%",
    position: "absolute",
    bottom: "8px",
  },

  ".react-calendar__viewContainer": {
    height: "330px",
    display: "flex",
  },
  ".react-calendar__month-view, .react-calendar__year-view, .react-calendar__decade-view":
    {
      flex: "1 0 0%", // This shorthand means: flex-grow: 1, flex-shrink: 0, flex-basis: 0%
      display: "flex",
      flexDirection: "column",
    },

  // --- Stage 3: Distribute Space Within Each View ---
  // Make the direct children of each view (the containers for tiles) also use flexbox.
  ".react-calendar__month-view > *, .react-calendar__year-view > *, .react-calendar__decade-view > *":
    {
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },

  // Make the rows of tiles grow and distribute space.
  ".react-calendar__month-view__days, .react-calendar__year-view__months, .react-calendar__decade-view__years":
    {
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },

  // Make each individual row of tiles a flex container.
  ".react-calendar__month-view__days > div, .react-calendar__year-view__months > div, .react-calendar__decade-view__years > div":
    {
      display: "flex",
      flex: 1,
    },

  // --- Stage 4: The Tiles ---
  // Finally, make each tile a flex item that can grow.
  ".react-calendar__tile": {
    flex: 1, // This is the key that makes them spread out evenly.
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    height: "auto", // Override any fixed height
    background: "none",
    border: "none",
    borderRadius: "50%",
  },
}));
