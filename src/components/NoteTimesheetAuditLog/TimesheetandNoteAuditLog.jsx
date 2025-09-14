import React, { useEffect, useState } from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { Typography, Box, Paper, Divider } from "@mui/material";
import { CheckCircle, Edit, Delete, Add } from "@mui/icons-material";
import dayjs from "dayjs";
import api from "../../api/axios";
import { useOnboardingQuery } from '../../stores/useOnboardingStore';

const actionIcons = {
  created: <Add color="success" fontSize="small" />,
  updated: <Edit color="primary" fontSize="small" />,
  submitted: <CheckCircle color="info" fontSize="small" />,
  approved: <CheckCircle color="success" fontSize="small" />,
  rejected: <Delete color="error" fontSize="small" />,
  shared: <Add color="warning" fontSize="small" />,
  status_changed: <Edit color="secondary" fontSize="small" />,
  deleted: <Delete color="error" fontSize="small" />,
};

const TimesheetandNoteAuditLog = ({progressNotes}) => {
  const [logs, setLogs] = useState([]);
  const { data: onboardingData, isLoading: isOnboardingLoading } = useOnboardingQuery();
  console.log('AudtiLogs',progressNotes?.auditLogs);

  useEffect(() => {
    const fetchLogForNoteById = async () => {
      try {
        const response = await api.get(
          "/progress-note/68af49d7969471fe5a9f5d24/audit-logs"
        );
        setLogs(response?.data);
      } catch (error) {
        console.error("Error Fetching Audit Log");
      }
    };
    fetchLogForNoteById();
  }, []);

  if (!logs || logs?.data?.logs?.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
      >
        No audit logs found.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: "80vh",
        overflowY: "auto",
        pr: 1,
      }}
    >
      <Timeline
        sx={{
          p: 0,
          m: 0,
          "& .MuiTimelineOppositeContent-root": {
            flex: 0.25,
            paddingRight: 1,
          },
          "& .MuiTimelineContent-root": {
            py: 0.5,
          },
        }}
      >
        {progressNotes?.auditLogs?.map((log, index) => (
          <TimelineItem
            sx={{ p: 0 }}
            key={log._id || index}
          >
            {/* Left side - timestamp & user */}
            <TimelineOppositeContent>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {dayjs(log.createdAt).format("DD MMM YYYY, hh:mm A")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.disabled" }}
              >
                {log.createdBy?.email || "Unknown"}
              </Typography>
            </TimelineOppositeContent>

            {/* Middle separator with icon */}
            <TimelineSeparator>
              <TimelineDot
                sx={{ boxShadow: 1, bgcolor: "background.paper", p: 0.5 }}
              >
                {actionIcons[log.action] || <Edit fontSize="small" />}
              </TimelineDot>
              {index !== logs?.data?.logs?.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            {/* Right side - content */}
            <TimelineContent sx={{ width: "100%" }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: "background.default",
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {log.action.toUpperCase()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: "text.secondary" }}
                >
                  {log.description}
                </Typography>
                {/* No need for the  */}
                {/* {log.changes &&
                  Object.keys(log.changes).length > 0 && (
                    <Box
                      sx={{
                        mt: 1,
                        pl: 1.5,
                        borderLeft: "2px solid",
                        borderColor: "divider",
                      }}
                    >
                      {Object.entries(log.changes).map(([key, value]) => (
                        <Typography
                          key={key}
                          variant="caption"
                          display="block"
                          sx={{ color: "text.secondary" }}
                        >
                          <strong>{key}:</strong>{" "}
                          {JSON.stringify(value)}
                        </Typography>
                      ))}
                    </Box>
                  )} */}
              </Paper>
              <Divider sx={{ mb: 1 }} />
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

export default TimesheetandNoteAuditLog;
