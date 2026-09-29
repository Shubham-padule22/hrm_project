import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Breadcrumbs,
  Link,
  Avatar,
  Grid,
  IconButton,
  Button,
  Card,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import GroupIcon from "@mui/icons-material/Group";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import PostNewJobModal from "./PostNewJobModal";
import CandidateRegister from "./CandidateRegister";
import InterviewCalendar from "./InterviewCalendar";
import PipelineView from "./PipelineView";
import OfferLetters from "./OfferLetters";
// Import your tab components here:
// import CandidateRegister from "./CandidateRegister";
// import InterviewCalendar from "./InterviewCalendar";
// import PipelineView from "./PipelineView";
// import OfferLetters from "./OfferLetters";

const stats = [
  {
    value: "447",
    title: "Open Positions",
    color: "#0E9F6E",
    bg: "#EEF9F4",
    iconBg: "#DDF5EA",
    icon: <WorkOutlineRoundedIcon fontSize="small" />,
  },
  {
    value: "89",
    title: "Active Candidates",
    color: "#0F62FE",
    bg: "#EEF4FF",
    iconBg: "#DCE8FF",
    icon: <Groups2OutlinedIcon fontSize="small" />,
  },
  {
    value: "12,840",
    title: "Interviews This Week",
    color: "#FF8A00",
    bg: "#FFF6ED",
    iconBg: "#FFE9D2",
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
  },
  {
    value: "6",
    title: "Offers Pending",
    color: "#6D28D9",
    bg: "#F4F0FD",
    iconBg: "#E8DDFE",
    icon: <HourglassBottomRoundedIcon fontSize="small" />,
  },
];

const departments = [
  {
    id: 1,
    name: "Senior EMT Driver",
    head: "Operations · Full-Time",
    letter: "O",
    color: "#0C3328",
    employees: 124,
    budget: "$52K–$62K",
    roles: "Jul 2026",
    location: "Chicago, IL",
    posted: "Posted 2024-06-01",
    priority: "Urgent",
    status: "Active",
  },
  {
    id: 2,
    name: "Medical Technician II",
    head: "Clinical · Full-Time",
    letter: "D",
    color: "#7C3AED",
    employees: 42,
    budget: "$52K–$62K",
    roles: "Jul 2026",
    location: "Chicago, IL",
    posted: "Posted 2024-06-01",
    priority: "High",
    status: "Active",
  },
  {
    id: 3,
    name: "Dispatch Coordinator",
    head: "Dispatch · Full-Time",
    letter: "F",
    color: "#F4A100",
    employees: 31,
    budget: "$52K–$62K",
    roles: "Jul 2026",
    location: "Chicago, IL",
    posted: "Posted 2024-06-01",
    priority: "High",
    status: "Active",
  },
  {
    id: 4,
    name: "Fleet Mechanic",
    head: "Fleet Management · Full-Time",
    letter: "I",
    color: "#0891B2",
    employees: 15,
    budget: "$52K–$62K",
    roles: "Jul 2026",
    location: "Chicago, IL",
    posted: "Posted 2024-06-01",
    priority: "High",
    status: "Active",
  },
  {
    id: 5,
    name: "Human Resources",
    head: "Priya Sharma",
    letter: "H",
    color: "#2563EB",
    employees: 18,
    budget: "$52K–$62K",
    roles: "Jul 2026",
    location: "West Side Depot",
    posted: "Posted 2024-06-01",
    priority: "High",
    status: "Active",
  },
  {
    id: 6,
    name: "Clinical",
    head: "Dr. Mark Evans",
    letter: "C",
    color: "#00B884",
    employees: 89,
    budget: "$52K–$62K",
    roles: "Jul 2026",
    location: "Chicago, IL",
    posted: "Posted 2024-06-01",
    priority: "High",
    status: "Active",
  },
];

const tabs1 = [
  "Job Openings",
  "Candidate Register",
  "Interview Calendar",
  "Pipeline",
  "Offer Letters",
];

const MotionCard = motion(Card);

export default function EmpDirectory() {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "auto%", pt: 2, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Breadcrumbs
            separator={
              <NavigateNextIcon fontSize="small" sx={{ color: "#919EAB" }} />
            }
            sx={{ mb: 1 }}
          >
            <Link
              underline="hover"
              color="#626A75"
              href="#"
              sx={{ fontSize: "0.875rem" }}
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="#626A75"
              href="#"
              sx={{ fontSize: "0.875rem" }}
            >
              Recruitment
            </Link>
            <Typography
              color="#1D293D"
              sx={{ fontSize: "0.875rem", fontWeight: 700 }}
            >
              Job Openings
            </Typography>
          </Breadcrumbs>
        </motion.div>

        <Box>
          <Grid container spacing={1}>
            {/* LEFT SIDEBAR (Stats & AI Insights) */}
            <Grid
              size={{
                xs: 12,
                lg: 3,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",

                  p: {
                    xs: 1.5,
                    sm: 1.8,
                    lg: 1.7,
                  },

                  borderRadius: "11px",

                  border: "1px solid #ECEEF2",

                  bgcolor: "#FFFFFF",

                  overflow: "hidden",
                }}
              >
                {/* =====================================================
        HEADER
    ====================================================== */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",

                    width: "100%",

                    mb: 1.8,

                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,

                      fontSize: {
                        xs: "0.9rem",
                        sm: "0.95rem",
                        lg: "1rem",
                      },

                      color: "#0F172B",

                      lineHeight: 1.2,

                      whiteSpace: "nowrap",
                    }}
                  >
                    Recruitment
                  </Typography>

                  <motion.div
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={
                        <AddIcon
                          sx={{
                            fontSize: "17px !important",
                          }}
                        />
                      }
                      onClick={() => setOpen(true)}
                      sx={{
                        minWidth: "auto",

                        height: 34,

                        px: 1.4,

                        borderRadius: "20px",

                        background:
                          "linear-gradient(90deg, #DC1F30 0%, #F04050 100%)",

                        fontSize: "0.72rem",

                        fontWeight: 600,

                        textTransform: "none",

                        whiteSpace: "nowrap",

                        boxShadow: "0 6px 18px rgba(241,50,67,.20)",

                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #D91D2E 0%, #ED3D4D 100%)",

                          boxShadow: "0 8px 20px rgba(241,50,67,.25)",
                        },

                        "& .MuiButton-startIcon": {
                          marginRight: "4px",
                        },
                      }}
                    >
                      Post New Job
                    </Button>
                  </motion.div>
                </Box>

                {/* =====================================================
        STATS
    ====================================================== */}

                <Stack
                  spacing={{
                    xs: 1.1,
                    sm: 1.3,
                  }}
                >
                  {stats.map((item) => (
                    <Paper
                      key={item.title}
                      elevation={0}
                      sx={{
                        width: "100%",

                        minHeight: {
                          xs: 88,
                          sm: 92,
                          lg: 94,
                        },

                        display: "flex",

                        alignItems: "center",

                        boxSizing: "border-box",

                        p: {
                          xs: 1.4,
                          sm: 1.5,
                          lg: 1.6,
                        },

                        borderRadius: "12px",

                        bgcolor: item.bg,

                        border: "1px solid rgba(0,0,0,0.045)",

                        transition: "transform 0.2s ease, box-shadow 0.2s ease",

                        "&:hover": {
                          transform: "translateY(-1px)",

                          boxShadow: "0 5px 14px rgba(15,23,42,0.05)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",

                          display: "flex",

                          alignItems: "center",
                        }}
                      >
                        {/* ICON */}

                        <Avatar
                          sx={{
                            width: {
                              xs: 40,
                              sm: 42,
                              lg: 43,
                            },

                            height: {
                              xs: 40,
                              sm: 42,
                              lg: 43,
                            },

                            flexShrink: 0,

                            bgcolor: item.iconBg,

                            color: item.color,

                            mr: {
                              xs: 1.3,
                              sm: 1.5,
                              lg: 1.6,
                            },
                          }}
                        >
                          {item.icon}
                        </Avatar>

                        {/* CONTENT */}

                        <Box
                          sx={{
                            minWidth: 0,

                            flex: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              color: item.color,

                              fontSize: {
                                xs: "1.35rem",
                                sm: "1.45rem",
                                lg: "1.55rem",
                              },

                              fontWeight: 700,

                              lineHeight: 1.1,

                              mb: 0.35,
                            }}
                          >
                            {item.value}
                          </Typography>

                          <Typography
                            sx={{
                              color: "#273142",

                              fontSize: {
                                xs: "0.76rem",
                                sm: "0.8rem",
                                lg: "0.82rem",
                              },

                              fontWeight: 500,

                              lineHeight: 1.25,

                              whiteSpace: "nowrap",

                              overflow: "hidden",

                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.title}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                {/* =====================================================
        AI INSIGHTS
    ====================================================== */}

                <Paper
                  elevation={0}
                  sx={{
                    width: "100%",

                    mt: 1.7,

                    p: {
                      xs: 1.4,
                      sm: 1.5,
                      lg: 1.6,
                    },

                    borderRadius: "12px",

                    background:
                      "linear-gradient(180deg, #F8F5FF 0%, #EEF2FF 100%)",

                    border: "1px solid #E8E5FF",

                    boxSizing: "border-box",
                  }}
                >
                  {/* AI HEADER */}

                  <Box
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      mb: 1.2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 24,

                        height: 24,

                        bgcolor: "#8B5CF6",

                        fontSize: 12,

                        mr: 0.8,

                        flexShrink: 0,
                      }}
                    >
                      <AutoAwesomeRoundedIcon
                        sx={{
                          fontSize: 14,
                        }}
                      />
                    </Avatar>

                    <Typography
                      sx={{
                        fontWeight: 700,

                        color: "#5B21B6",

                        fontSize: {
                          xs: "0.85rem",
                          sm: "0.9rem",
                          lg: "0.92rem",
                        },

                        lineHeight: 1.2,
                      }}
                    >
                      AI Insights
                    </Typography>
                  </Box>

                  {/* AI CONTENT */}

                  <Stack spacing={0.8}>
                    <Typography
                      sx={{
                        color: "#7E22CE",

                        fontSize: {
                          xs: "0.68rem",
                          sm: "0.7rem",
                          lg: "0.72rem",
                        },

                        lineHeight: 1.4,
                      }}
                    >
                      • Fatima Al-Hassan has a 92% AI match score for Medical
                      Technician — recommend fast-track.
                    </Typography>

                    <Typography
                      sx={{
                        color: "#7E22CE",

                        fontSize: {
                          xs: "0.68rem",
                          sm: "0.7rem",
                          lg: "0.72rem",
                        },

                        lineHeight: 1.4,
                      }}
                    >
                      • EMT Driver role has the highest urgency — 5 open
                      positions will align if deadline is met.
                    </Typography>

                    <Typography
                      sx={{
                        color: "#7E22CE",

                        fontSize: {
                          xs: "0.68rem",
                          sm: "0.7rem",
                          lg: "0.72rem",
                        },

                        lineHeight: 1.4,
                      }}
                    >
                      • 5 candidates are in the final interview stage and
                      require action today.
                    </Typography>
                  </Stack>
                </Paper>
              </Paper>
            </Grid>

            {/* RIGHT TABS AND DYNAMIC CONTENT */}
            <Grid item xs={12} lg={9} size={9}>
              <Grid container spacing={2}>
                {/* Top Nav Tabs */}
                <Grid item xs={12} size={12}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    TabIndicatorProps={{
                      sx: {
                        bgcolor: "#F13243",
                        height: 3,
                        borderRadius: "3px",
                        display: "flex",
                        justifyContent: "space-between",
                      },
                    }}
                  >
                    {tabs1.map((item) => (
                      <Tab
                        key={item}
                        label={item}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          color: "#626A75",
                          borderBottom: "1px solid #E5E7EB",
                          "&.Mui-selected": { color: "#0C3328" },
                        }}
                      />
                    ))}
                  </Tabs>
                </Grid>

                {/* ======================================= */}
                {/* TAB 0 : JOB OPENINGS CONTENT */}
                {/* ======================================= */}
                {tabValue === 0 && (
                  <>
                    <Grid item xs={12} size={12}>
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <TextField
                          placeholder="Search jobs, candidates, positions..."
                          size="small"
                          sx={{
                            width: 340,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 10,
                              bgcolor: "#F8FAFC",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<FilterAltOutlinedIcon />}
                            variant="outlined"
                            sx={{ borderRadius: 10, textTransform: "none" }}
                          >
                            Filters
                          </Button>
                          <Button
                            size="small"
                            startIcon={<SwapVertOutlinedIcon />}
                            variant="outlined"
                            sx={{ borderRadius: 10, textTransform: "none" }}
                          >
                            Sort
                          </Button>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label="All"
                            color="success"
                            sx={{ borderRadius: 10 }}
                          />
                          <Chip label="Active" variant="outlined" />
                          <Chip label="Closed" variant="outlined" />
                          <Chip label="Draft" variant="outlined" />
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Map Departments Array */}
                    {departments.map((dept, index) => (
                      <Grid
                        item
                        key={dept.id}
                        xs={12}
                        sm={6}
                        md={6}
                        lg={4}
                        size={6}
                      >
                        <MotionCard
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.4 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          sx={{
                            borderRadius: 4,
                            p: 2,
                            border: "1px solid #EEF2F7",
                            boxShadow: "0 10px 30px rgba(0,0,0,.05)",
                            cursor: "pointer",
                            transition: ".3s",
                            "&:hover": {
                              boxShadow: "0 20px 40px rgba(0,0,0,.08)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              textAlign: "left",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "#F0FAF7",
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                <WorkOutlineOutlinedIcon
                                  sx={{ color: "#0C3328", fontSize: 18 }}
                                />
                              </Avatar>
                              <Box sx={{ ml: 1 }}>
                                <Typography
                                  fontWeight={700}
                                  sx={{ fontSize: ".8rem", fontWeight: "600" }}
                                >
                                  {dept.name}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: ".7rem", color: "#626A75" }}
                                >
                                  Head: {dept.head}
                                </Typography>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                ml: 1,
                              }}
                            >
                              <Chip
                                label={dept.priority || "Urgent"}
                                size="small"
                                sx={{
                                  height: 27,
                                  borderRadius: "20px",
                                  backgroundColor: "#FEE2E5",
                                  color: "#DC2626",
                                  fontWeight: 600,
                                  fontSize: "0.72rem",
                                }}
                              />
                              <Chip
                                label={dept.status || "Active"}
                                size="small"
                                sx={{
                                  height: 27,
                                  borderRadius: "20px",
                                  backgroundColor: "#DCFDF2",
                                  color: "#059669",
                                  fontWeight: 600,
                                  fontSize: "0.72rem",
                                }}
                              />
                            </Box>
                          </Box>
                          <Grid container spacing={1} mt={1.5}>
                            <Grid item xs={4} md={4} size={4}>
                              <Box
                                sx={{
                                  bgcolor: "#F0FAF7",
                                  borderRadius: 2,
                                  py: 1,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: "700",
                                    fontSize: ".8rem",
                                    color: "#0C3328",
                                  }}
                                >
                                  {dept.employees}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: ".8rem",
                                    fontWeight: "600",
                                    color: "#626A75",
                                  }}
                                >
                                  Applicants
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4} md={4} size={4}>
                              <Box
                                sx={{
                                  bgcolor: "#EFF6FF",
                                  borderRadius: 2,
                                  py: 1,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: "700",
                                    fontSize: ".8rem",
                                    color: "#1447E6",
                                  }}
                                >
                                  {dept.budget}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: ".8rem",
                                    fontWeight: "600",
                                    color: "#626A75",
                                  }}
                                >
                                  Salary Range
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4} md={4} size={4}>
                              <Box
                                sx={{
                                  bgcolor: "#F8FAFC",
                                  borderRadius: 2,
                                  py: 1,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: "700",
                                    fontSize: ".8rem",
                                    color: "#314158",
                                  }}
                                >
                                  {dept.roles}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: ".8rem",
                                    fontWeight: "600",
                                    color: "#626A75",
                                  }}
                                >
                                  Deadline
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          <Divider
                            sx={{ mt: 1.8, mb: 1.5, borderColor: "#EEF2F7" }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                }}
                              >
                                <LocationOnOutlinedIcon
                                  sx={{ fontSize: 17, color: "#737B87" }}
                                />
                                <Typography
                                  sx={{ fontSize: "0.78rem", color: "#68717D" }}
                                >
                                  {"Chicago, IL"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                }}
                              >
                                <CalendarTodayOutlinedIcon
                                  sx={{ fontSize: 15, color: "#737B87" }}
                                />
                                <Typography
                                  sx={{ fontSize: "0.78rem", color: "#68717D" }}
                                >
                                  Posted {"2026-08-07"}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              endIcon={<ChevronRightIcon />}
                              sx={{
                                minWidth: "auto",
                                p: 0,
                                color: "#0C3328",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                textTransform: "none",
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        </MotionCard>
                      </Grid>
                    ))}
                  </>
                )}

                {tabValue === 1 && (
                  <Grid item xs={12} size={12}>
                    <CandidateRegister />
                  </Grid>
                )}

                {/* ======================================= */}
                {/* TAB 2 : INTERVIEW CALENDAR CONTENT */}
                {/* ======================================= */}
                {tabValue === 2 && (
                  <Grid item xs={12} size={12}>
                    <InterviewCalendar />
                  </Grid>
                )}

                {/* ======================================= */}
                {/* TAB 3 : PIPELINE CONTENT */}
                {/* ======================================= */}
                {tabValue === 3 && (
                  <Grid item xs={12} size={12}>
                    <PipelineView />
                  </Grid>
                )}

                {tabValue === 4 && (
                  <Grid item xs={12} size={12}>
                    <OfferLetters />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <PostNewJobModal open={open} handleClose={() => setOpen(false)} />
    </Box>
  );
}
