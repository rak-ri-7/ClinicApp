import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import dayjs from "dayjs";

const VisitTabs = ({ visits, activeIndex, onTabChange, patient }) => {
  if (visits.length === 0) return null;

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs value={activeIndex} onChange={onTabChange} variant="scrollable">
        {visits.map((visit, index) => {
          let tabLabel = "";
          if (visit.isFollowUp) {
            tabLabel = "Follow-up Visit";
          } else if (visit.isDuesPayment) {
            tabLabel = `Dues on ${dayjs(visit.date).format("DD MMM 'YY")}`;
          } else {
            const isNewUnsavedVisit =
              !patient || index >= (patient?.visitHistory?.length || 0);
            tabLabel = isNewUnsavedVisit
              ? "New Clinical Visit"
              : `Visit on ${dayjs(visit.date).format("DD MMM 'YY")}`;
          }
          return (
            <Tab label={tabLabel} key={visit._id || `new-visit-${index}`} />
          );
        })}
      </Tabs>
    </Box>
  );
};

export default VisitTabs;
