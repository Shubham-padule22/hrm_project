import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";

// =====================================================
// MOCK DATA
// =====================================================

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// July 2024 starts on Monday
const calendarCells = Array.from({ length: 35 }, (_, i) => {
  if (i === 0 || i > 31) {
    return {
      isEmpty: true,
      id: `empty-${i}`,
    };
  }

  const date = i;

  return {
    date,
    id: `date-${date}`,
    hasEvent: [8, 11, 15, 18, 22, 25].includes(date),
    isActive: date === 24,
    isEmpty: false,
  };
});

// =====================================================
// TODAY'S INTERVIEWS
// =====================================================

const todaysInterviews = [
  {
    id: 1,
    time: "10:00 AM",
    name: "Anthony Reeves",
    role: "EMT Driver - Technical",
    type: "In Person",
    typeColor: "#059669",
    typeBg: "#D1FAE5",
  },
  {
    id: 2,
    time: "2:00 PM",
    name: "Yuki Tanaka",
    role: "HR Business Partner - Final",
    type: "Video Call",
    typeColor: "#2563EB",
    typeBg: "#DBEAFE",
  },
  {
    id: 3,
    time: "4:00 PM",
    name: "Fatima Al-Hassan",
    role: "Medical Tech II - HR Screen",
    type: "Phone",
    typeColor: "#D97706",
    typeBg: "#FEF3C7",
  },
];

// =====================================================
// INTERVIEW PANEL
// =====================================================

const interviewPanel = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "HR Manager",
    initials: "PS",
    avatarBg: "#0C3328",
    count: 3,
  },
  {
    id: 2,
    name: "Dr. Mark Evans",
    role: "Clinical Head",
    initials: "DME",
    avatarBg: "#2563EB",
    count: 2,
  },
  {
    id: 3,
    name: "Sarah Chen",
    role: "Ops Director",
    initials: "SC",
    avatarBg: "#7C3AED",
    count: 1,
  },
];

// =====================================================
// COMMON STYLE
// =====================================================

const truncateSx = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// =====================================================
// COMPONENT
// =====================================================

export default function InterviewCalendar() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      style={{
        width: "100%",
      }}
    >
      {/* =================================================
          SEARCH + FILTER BAR
      ================================================== */}

      <Box
        sx={{
          width: "100%",
          minHeight: 48,

          mb: 1.4,

          px: {
            xs: 1.2,
            sm: 1.8,
          },

          py: {
            xs: 1,
            md: 0.9,
          },

          backgroundColor: "#FFFFFF",

          borderRadius: "10px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          gap: 1.5,

          flexWrap: "wrap",

          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            SEARCH + FILTER
        ================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            gap: 1.2,

            flex: 1,

            minWidth: 0,
          }}
        >
          {/* SEARCH */}

          <TextField
            placeholder="Search jobs, candidates, positions..."
            size="small"
            sx={{
              width: {
                xs: "100%",
                sm: 340,
                md: 455,
              },

              "& .MuiOutlinedInput-root": {
                height: 38,

                borderRadius: "9px",

                backgroundColor: "#F8FAFC",

                "& fieldset": {
                  border: "1px solid #E9EEF4",
                },

                "&:hover fieldset": {
                  borderColor: "#DDE4EC",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#DDE4EC",
                },
              },

              "& input": {
                fontSize: "12px",

                color: "#475569",

                padding: "8px 8px",
              },

              "& input::placeholder": {
                color: "#94A3B8",

                opacity: 1,

                fontSize: "12px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      fontSize: 17,
                      color: "#94A3B8",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* FILTER + SORT */}

          <Stack
            direction="row"
            spacing={0.7}
            sx={{
              flexShrink: 0,
            }}
          >
            <Button
              size="small"
              startIcon={
                <FilterAltOutlinedIcon
                  sx={{
                    fontSize: "14px !important",
                  }}
                />
              }
              sx={{
                height: 34,

                minWidth: 78,

                px: 1.2,

                borderRadius: "8px",

                textTransform: "none",

                fontSize: "11px",

                fontWeight: 500,

                color: "#64748B",

                backgroundColor: "#FFFFFF",

                border: "1px solid #E9EEF4",

                "&:hover": {
                  backgroundColor: "#F8FAFC",

                  borderColor: "#DDE4EC",
                },
              }}
            >
              Filters
            </Button>

            <Button
              size="small"
              startIcon={
                <SwapVertOutlinedIcon
                  sx={{
                    fontSize: "14px !important",
                  }}
                />
              }
              sx={{
                height: 34,

                minWidth: 67,

                px: 1.2,

                borderRadius: "8px",

                textTransform: "none",

                fontSize: "11px",

                fontWeight: 500,

                color: "#64748B",

                backgroundColor: "#FFFFFF",

                border: "1px solid #E9EEF4",

                "&:hover": {
                  backgroundColor: "#F8FAFC",

                  borderColor: "#DDE4EC",
                },
              }}
            >
              Sort
            </Button>
          </Stack>
        </Box>

        {/* =================================================
            STATUS FILTER
        ================================================== */}

        <Stack
          direction="row"
          spacing={0.3}
          sx={{
            flexShrink: 0,

            alignItems: "center",
          }}
        >
          <Chip
            label="All"
            sx={{
              height: 34,

              minWidth: 58,

              borderRadius: "18px",

              backgroundColor: "#0C3328",

              color: "#FFFFFF",

              fontSize: "11px",

              fontWeight: 700,
            }}
          />

          <Chip
            label="Active"
            sx={{
              height: 34,

              borderRadius: "18px",

              backgroundColor: "transparent",

              color: "#64748B",

              fontSize: "11px",

              fontWeight: 500,
            }}
          />

          <Chip
            label="Closed"
            sx={{
              height: 34,

              borderRadius: "18px",

              backgroundColor: "transparent",

              color: "#64748B",

              fontSize: "11px",

              fontWeight: 500,
            }}
          />

          <Chip
            label="Draft"
            sx={{
              height: 34,

              borderRadius: "18px",

              backgroundColor: "transparent",

              color: "#64748B",

              fontSize: "11px",

              fontWeight: 500,
            }}
          />
        </Stack>
      </Box>

      {/* =================================================
          MAIN CONTENT
      ================================================== */}

      <Grid
        container
        spacing={1.4}
        sx={{
          width: "100%",
          margin: 0,
        }}
      >
        {/* =================================================
            LEFT - CALENDAR
        ================================================== */}

        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",

              minHeight: {
                xs: "auto",
                md: 430,
              },

              height: "100%",

              boxSizing: "border-box",

              backgroundColor: "#FFFFFF",

              border: "1px solid #E9EEF4",

              borderRadius: "11px",

              p: {
                xs: 1.7,
                sm: 2,
                md: 2,
              },

              overflow: "hidden",
            }}
          >
            {/* =================================================
                TITLE
            ================================================== */}

            <Typography
              sx={{
                fontSize: "13px",

                fontWeight: 700,

                color: "#1E293B",

                mb: 2.2,
              }}
            >
              Interview Schedule — July 2024
            </Typography>

            {/* =================================================
                DAYS HEADER
            ================================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",

                columnGap: {
                  xs: 0.7,
                  sm: 1,
                },

                mb: 1,

                textAlign: "center",
              }}
            >
              {daysOfWeek.map((day) => (
                <Typography
                  key={day}
                  sx={{
                    fontSize: "10px",

                    fontWeight: 500,

                    color: "#64748B",

                    lineHeight: 1.5,
                  }}
                >
                  {day}
                </Typography>
              ))}
            </Box>

            {/* =================================================
                CALENDAR
            ================================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",

                gap: {
                  xs: 0.8,
                  sm: 1,
                },
              }}
            >
              {calendarCells.map((cell) => {
                // Empty cell
                if (cell.isEmpty) {
                  return (
                    <Box
                      key={cell.id}
                      sx={{
                        minWidth: 0,

                        height: {
                          xs: 62,
                          sm: 68,
                          md: 76,
                        },

                        borderRadius: "10px",

                        border: "1px solid #EDF1F5",

                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  );
                }

                return (
                  <Box
                    key={cell.id}
                    sx={{
                      minWidth: 0,

                      height: {
                        xs: 62,
                        sm: 68,
                        md: 76,
                      },

                      display: "flex",

                      flexDirection: "column",

                      justifyContent: "center",

                      alignItems: "center",

                      borderRadius: "10px",

                      border: cell.isActive ? "none" : "1px solid #E9EEF4",

                      backgroundColor: cell.isActive
                        ? "#0C3328"
                        : cell.hasEvent
                          ? "#EFF6FF"
                          : "#FFFFFF",

                      color: cell.isActive
                        ? "#FFFFFF"
                        : cell.hasEvent
                          ? "#2563EB"
                          : "#334155",

                      cursor: "pointer",

                      transition: "all 0.18s ease",

                      "&:hover": {
                        transform: "translateY(-1px)",

                        boxShadow: cell.isActive
                          ? "none"
                          : "0 4px 12px rgba(15,23,42,0.06)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "11px",
                          md: "12px",
                        },

                        lineHeight: 1,

                        fontWeight: cell.isActive || cell.hasEvent ? 700 : 500,
                      }}
                    >
                      {cell.date}
                    </Typography>

                    {/* EVENT DOT */}

                    {cell.hasEvent && (
                      <Box
                        sx={{
                          width: 4,

                          height: 4,

                          borderRadius: "50%",

                          backgroundColor: "#2563EB",

                          mt: 0.6,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Stack
            spacing={1.4}
            sx={{
              height: "100%",
            }}
          >
            {/* =================================================
                TODAY'S INTERVIEWS
            ================================================== */}

            <Paper
              elevation={0}
              sx={{
                width: "100%",

                backgroundColor: "#FFFFFF",

                border: "1px solid #E9EEF4",

                borderRadius: "11px",

                p: {
                  xs: 1.7,
                  sm: 1.9,
                },

                boxSizing: "border-box",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",

                  fontWeight: 700,

                  color: "#1E293B",

                  mb: 1.6,
                }}
              >
                Today's Interviews
              </Typography>

              <Stack spacing={0.9}>
                {todaysInterviews.map((interview) => (
                  <Box
                    key={interview.id}
                    sx={{
                      display: "flex",

                      alignItems: "flex-start",

                      gap: 1.1,

                      px: 1.2,

                      py: 1.1,

                      minHeight: 67,

                      backgroundColor: "#F8FAFC",

                      borderRadius: "9px",

                      boxSizing: "border-box",
                    }}
                  >
                    {/* TIME */}

                    <Typography
                      sx={{
                        minWidth: 53,

                        flexShrink: 0,

                        fontSize: "8px",

                        fontWeight: 700,

                        color: "#1E293B",

                        pt: 0.2,
                      }}
                    >
                      {interview.time}
                    </Typography>

                    {/* DETAILS */}

                    <Box
                      sx={{
                        minWidth: 0,

                        flex: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",

                          fontWeight: 700,

                          lineHeight: 1.3,

                          color: "#1E293B",

                          mb: 0.3,

                          ...truncateSx,
                        }}
                      >
                        {interview.name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "8px",

                          lineHeight: 1.3,

                          color: "#94A3B8",

                          mb: 0.8,

                          ...truncateSx,
                        }}
                      >
                        {interview.role}
                      </Typography>

                      <Chip
                        label={interview.type}
                        size="small"
                        sx={{
                          height: 19,

                          borderRadius: "5px",

                          backgroundColor: interview.typeBg,

                          color: interview.typeColor,

                          fontSize: "7px",

                          fontWeight: 700,

                          "& .MuiChip-label": {
                            px: 0.8,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* =================================================
                INTERVIEW PANEL
            ================================================== */}

            <Paper
              elevation={0}
              sx={{
                width: "100%",

                backgroundColor: "#FFFFFF",

                border: "1px solid #E9EEF4",

                borderRadius: "11px",

                p: {
                  xs: 1.7,
                  sm: 1.9,
                },

                boxSizing: "border-box",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",

                  fontWeight: 700,

                  color: "#1E293B",

                  mb: 1.6,
                }}
              >
                Interview Panel
              </Typography>

              <Stack spacing={1.5}>
                {interviewPanel.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: "space-between",

                      gap: 1,
                    }}
                  >
                    {/* MEMBER INFO */}

                    <Box
                      sx={{
                        display: "flex",

                        alignItems: "center",

                        gap: 1,

                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 27,

                          height: 27,

                          flexShrink: 0,

                          backgroundColor: member.avatarBg,

                          fontSize: "7px",

                          fontWeight: 700,
                        }}
                      >
                        {member.initials}
                      </Avatar>

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "9px",

                            lineHeight: 1.3,

                            fontWeight: 700,

                            color: "#1E293B",

                            ...truncateSx,
                          }}
                        >
                          {member.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "7.5px",

                            lineHeight: 1.3,

                            color: "#94A3B8",

                            ...truncateSx,
                          }}
                        >
                          {member.role}
                        </Typography>
                      </Box>
                    </Box>

                    {/* COUNT */}

                    <Box
                      sx={{
                        width: 17,

                        height: 17,

                        flexShrink: 0,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        borderRadius: "50%",

                        backgroundColor: "#ECFDF5",

                        color: "#065F46",

                        fontSize: "7px",

                        fontWeight: 700,
                      }}
                    >
                      {member.count}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </motion.div>
  );
}
