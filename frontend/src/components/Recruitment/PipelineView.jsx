import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Paper, Avatar, Chip, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import { TextField, InputAdornment, Button } from "@mui/material";
// =====================================================
// PIPELINE DATA
// =====================================================

const pipelineData = [
  {
    id: "col-1",
    title: "Applied",
    count: 0,
    candidates: [],
  },
  {
    id: "col-2",
    title: "HR Screening",
    count: 1,
    candidates: [
      {
        id: "c-1",
        name: "Fatima Al-Hassan",
        role: "Medical Technician",
        avatar: "FA",
        avatarBg: "#0C3328",
        aiScore: "AI 92%",
        aiBg: "#10B981",
        status: "Shortlisted",
        statusColor: "#2563EB",
        statusBg: "#DBEAFE",
      },
    ],
  },
  {
    id: "col-3",
    title: "Technical Interview",
    count: 1,
    candidates: [
      {
        id: "c-2",
        name: "Anthony Reeves",
        role: "Senior EMT Driver",
        avatar: "AR",
        avatarBg: "#0C3328",
        aiScore: "AI 87%",
        aiBg: "#3B82F6",
        status: "In Progress",
        statusColor: "#2563EB",
        statusBg: "#DBEAFE",
      },
    ],
  },
  {
    id: "col-4",
    title: "Final Interview",
    count: 1,
    candidates: [
      {
        id: "c-3",
        name: "Yuki Tanaka",
        role: "HR Business Partner",
        avatar: "YT",
        avatarBg: "#0C3328",
        aiScore: "AI 95%",
        aiBg: "#10B981",
        status: "In Progress",
        statusColor: "#2563EB",
        statusBg: "#DBEAFE",
      },
    ],
  },
  {
    id: "col-5",
    title: "Background Check",
    count: 1,
    candidates: [
      {
        id: "c-4",
        name: "Robert Mensah",
        role: "Senior EMT Driver",
        avatar: "RM",
        avatarBg: "#0C3328",
        aiScore: "AI 83%",
        aiBg: "#3B82F6",
        status: "In Progress",
        statusColor: "#2563EB",
        statusBg: "#DBEAFE",
      },
    ],
  },
  {
    id: "col-6",
    title: "Offer",
    count: 1,
    candidates: [
      {
        id: "c-5",
        name: "Chris Donnelly",
        role: "Dispatch Coordinator",
        avatar: "CD",
        avatarBg: "#0C3328",
        aiScore: "AI 79%",
        aiBg: "#3B82F6",
        status: "Offer Sent",
        statusColor: "#9333EA",
        statusBg: "#F3E8FF",
      },
    ],
  },
];

// =====================================================
// PIPELINE VIEW
// =====================================================

export default function PipelineView() {
  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",

        "&::-webkit-scrollbar": {
          height: "4px",
        },

        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },

        "&::-webkit-scrollbar-thumb": {
          background: "#CBD5E1",
          borderRadius: "10px",
        },
      }}
    >
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
      {/* =====================================================
          PIPELINE CONTAINER
      ===================================================== */}

      <Box
        sx={{
          display: "flex",

          gap: {
            xs: 1,
            sm: 1.2,
            md: 1.5,
          },

          width: "100%",

          minWidth: {
            xs: "760px",
            md: "100%",
          },

          alignItems: "flex-start",
        }}
      >
        {pipelineData.map((column, colIndex) => (
          <Box
            key={column.id}
            sx={{
              flex: 1,

              minWidth: {
                xs: 112,
                sm: 115,
                md: 0,
              },

              maxWidth: {
                md: "none",
              },
            }}
          >
            {/* =================================================
                COLUMN HEADER
            ================================================= */}

            <Box
              sx={{
                height: 25,

                display: "flex",

                alignItems: "center",

                justifyContent: "space-between",

                mb: 0.7,

                px: 0.2,
              }}
            >
              <Typography
                sx={{
                  color: "#1E293B",

                  fontSize: {
                    xs: "8px",
                    sm: "8.5px",
                    md: "9px",
                  },

                  fontWeight: 700,

                  lineHeight: 1.2,

                  whiteSpace: "nowrap",

                  overflow: "hidden",

                  textOverflow: "ellipsis",
                }}
              >
                {column.title}
              </Typography>

              {/* COUNT */}

              <Box
                sx={{
                  width: 14,

                  height: 14,

                  flexShrink: 0,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  borderRadius: "50%",

                  backgroundColor: "#F1F5F9",

                  color: "#64748B",

                  fontSize: "6.5px",

                  fontWeight: 700,
                }}
              >
                {column.count}
              </Box>
            </Box>

            {/* =================================================
                CANDIDATES
            ================================================= */}

            <Stack spacing={1}>
              {/* =================================================
                  EMPTY CARD
              ================================================= */}

              {column.candidates.length === 0 ? (
                <Box
                  sx={{
                    width: "100%",

                    height: {
                      xs: 70,
                      sm: 72,
                      md: 74,
                    },

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    border: "1px dashed #CBD5E1",

                    borderRadius: "8px",

                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#94A3B8",

                      fontSize: {
                        xs: "6px",
                        sm: "6.5px",
                        md: "7px",
                      },

                      fontWeight: 500,
                    }}
                  >
                    No candidates
                  </Typography>
                </Box>
              ) : (
                column.candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,

                      delay: colIndex * 0.08 + index * 0.08,
                    }}
                  >
                    {/* =================================================
                          CANDIDATE CARD
                      ================================================= */}

                    <Paper
                      elevation={0}
                      sx={{
                        width: "100%",

                        minHeight: {
                          xs: 70,
                          sm: 72,
                          md: 74,
                        },

                        p: {
                          xs: 0.9,
                          sm: 1,
                          md: 1.1,
                        },

                        border: "1px solid #E2E8F0",

                        borderRadius: "8px",

                        backgroundColor: "#FFFFFF",

                        boxSizing: "border-box",

                        transition: "all 0.2s ease",

                        cursor: "grab",

                        "&:hover": {
                          borderColor: "#CBD5E1",

                          boxShadow: "0 4px 12px rgba(15,23,42,0.08)",

                          transform: "translateY(-1px)",
                        },

                        "&:active": {
                          cursor: "grabbing",
                        },
                      }}
                    >
                      {/* =================================================
                            USER INFO
                        ================================================= */}

                      <Box
                        sx={{
                          display: "flex",

                          alignItems: "center",

                          gap: 0.7,

                          mb: 0.8,

                          minWidth: 0,
                        }}
                      >
                        {/* AVATAR */}

                        <Avatar
                          sx={{
                            width: {
                              xs: 24,
                              sm: 25,
                              md: 26,
                            },

                            height: {
                              xs: 24,
                              sm: 25,
                              md: 26,
                            },

                            flexShrink: 0,

                            bgcolor: candidate.avatarBg,

                            fontSize: {
                              xs: "6px",
                              sm: "6.5px",
                              md: "7px",
                            },

                            fontWeight: 700,
                          }}
                        >
                          {candidate.avatar}
                        </Avatar>

                        {/* TEXT */}

                        <Box
                          sx={{
                            minWidth: 0,

                            flex: 1,
                          }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              color: "#0F172B",

                              fontSize: {
                                xs: "7px",
                                sm: "7.5px",
                                md: "8px",
                              },

                              fontWeight: 700,

                              lineHeight: 1.2,

                              overflow: "hidden",

                              textOverflow: "ellipsis",

                              whiteSpace: "nowrap",
                            }}
                          >
                            {candidate.name}
                          </Typography>

                          <Typography
                            noWrap
                            sx={{
                              color: "#64748B",

                              fontSize: {
                                xs: "5.5px",
                                sm: "6px",
                                md: "6.5px",
                              },

                              lineHeight: 1.2,

                              mt: 0.25,

                              overflow: "hidden",

                              textOverflow: "ellipsis",

                              whiteSpace: "nowrap",
                            }}
                          >
                            {candidate.role}
                          </Typography>
                        </Box>
                      </Box>

                      {/* =================================================
                            BADGES
                        ================================================= */}

                      <Box
                        sx={{
                          display: "flex",

                          alignItems: "center",

                          justifyContent: "space-between",

                          gap: 0.4,

                          width: "100%",
                        }}
                      >
                        {/* AI */}

                        <Chip
                          label={candidate.aiScore}
                          size="small"
                          sx={{
                            height: 15,

                            minWidth: 29,

                            borderRadius: "5px",

                            backgroundColor: candidate.aiBg,

                            color: "#FFFFFF",

                            fontSize: {
                              xs: "5px",
                              sm: "5.5px",
                              md: "6px",
                            },

                            fontWeight: 700,

                            "& .MuiChip-label": {
                              px: 0.55,
                            },
                          }}
                        />

                        {/* STATUS */}

                        <Chip
                          label={candidate.status}
                          size="small"
                          sx={{
                            height: 15,

                            maxWidth: "62%",

                            borderRadius: "5px",

                            backgroundColor: candidate.statusBg,

                            color: candidate.statusColor,

                            fontSize: {
                              xs: "5px",
                              sm: "5.5px",
                              md: "6px",
                            },

                            fontWeight: 700,

                            "& .MuiChip-label": {
                              px: 0.55,

                              overflow: "hidden",

                              textOverflow: "ellipsis",

                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </Box>
                    </Paper>
                  </motion.div>
                ))
              )}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
