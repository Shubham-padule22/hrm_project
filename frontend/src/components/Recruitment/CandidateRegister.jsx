import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import CustomPagination from "../../components/common/Custompagination";

// =====================================================
// DEFAULT CANDIDATES
// =====================================================

const defaultCandidates = [
  {
    id: 1,
    name: "Anthony Reeves",
    email: "anthony.r@gmail.com",
    avatarBg: "#0C3328",
    appliedFor: "Senior EMT Driver",
    stage: "Technical Interview",
    completedDots: 3,
    totalDots: 6,
    aiScore: 87,
    experience: "6 years",
    location: "Chicago, IL",
    appliedDate: "2024-06-03",
    status: "Active",
  },
  {
    id: 2,
    name: "Fatima Al-Hassan",
    email: "fatima.h@outlook.com",
    avatarBg: "#2563EB",
    appliedFor: "Medical Technician II",
    stage: "HR Screening",
    completedDots: 2,
    totalDots: 6,
    aiScore: 92,
    experience: "4 years",
    location: "Evanston, IL",
    appliedDate: "2024-06-06",
    status: "Active",
  },
  {
    id: 3,
    name: "Chris Donnelly",
    email: "chris.d@gmail.com",
    avatarBg: "#7C3AED",
    appliedFor: "Dispatch Coordinator",
    stage: "Offer",
    completedDots: 6,
    totalDots: 6,
    aiScore: 79,
    experience: "3 years",
    location: "Oak Park, IL",
    appliedDate: "2024-06-09",
    status: "Active",
  },
  {
    id: 4,
    name: "Yuki Tanaka",
    email: "yuki.t@yahoo.com",
    avatarBg: "#DC2626",
    appliedFor: "HR Business Partner",
    stage: "Final Interview",
    completedDots: 4,
    totalDots: 6,
    aiScore: 95,
    experience: "8 years",
    location: "Chicago, IL",
    appliedDate: "2024-06-11",
    status: "Active",
  },
  {
    id: 5,
    name: "Robert Mensah",
    email: "robert.m@gmail.com",
    avatarBg: "#059669",
    appliedFor: "Senior EMT Driver",
    stage: "Background Check",
    completedDots: 5,
    totalDots: 6,
    aiScore: 83,
    experience: "5 years",
    location: "Cicero, IL",
    appliedDate: "2024-06-04",
    status: "Active",
  },
  {
    id: 6,
    name: "Grace Kim",
    email: "grace.k@gmail.com",
    avatarBg: "#D97706",
    appliedFor: "Billing Specialist",
    stage: "Rejected",
    completedDots: 0,
    totalDots: 6,
    aiScore: 61,
    experience: "2 years",
    location: "Chicago, IL",
    appliedDate: "2024-06-13",
    status: "Closed",
  },
];

// =====================================================
// COLUMN WIDTHS
// =====================================================

const COL_WIDTHS = {
  candidate: "22%",
  appliedFor: "15%",
  stage: "16%",
  aiScore: "9%",
  experience: "8%",
  location: "11%",
  applied: "10%",
  action: "9%",
};

// =====================================================
// RESPONSIVE HIDE
// =====================================================

const HIDE_ON_SM = {
  display: {
    xs: "none",
    sm: "table-cell",
  },
};

const HIDE_ON_MD = {
  display: {
    xs: "none",
    md: "table-cell",
  },
};

// =====================================================
// SCORE COLOR
// =====================================================

const scoreColor = (score) => {
  if (score >= 90) return "#059669";
  if (score >= 80) return "#2563EB";
  if (score >= 70) return "#7C3AED";
  return "#D97706";
};

// =====================================================
// TABLE STYLES
// =====================================================

const headerCellSx = {
  color: "#626A75",
  fontWeight: 700,
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  py: 1.5,
  px: 1.5,
  whiteSpace: "nowrap",
};

const bodyCellSx = {
  fontSize: "0.78rem",
  color: "#374151",
  px: 1.5,
  py: 1.25,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const ITEMS_PER_PAGE = 6;

const MotionTableRow = motion(TableRow);

// =====================================================
// COMPONENT
// =====================================================

export default function CandidateRegister({ candidates = defaultCandidates }) {
  const [page, setPage] = useState(1);

  // SEARCH
  const [search, setSearch] = useState("");

  // ACTIVE TAB
  const [activeTab, setActiveTab] = useState("All");

  // FILTER MENU
  const [filterAnchor, setFilterAnchor] = useState(null);

  // SORT MENU
  const [sortAnchor, setSortAnchor] = useState(null);

  // STAGE FILTER
  const [stageFilter, setStageFilter] = useState("All");

  // SCORE FILTER
  const [scoreFilter, setScoreFilter] = useState("All");

  // SORT
  const [sortBy, setSortBy] = useState("");

  // =====================================================
  // FILTER MENU
  // =====================================================

  const openFilterMenu = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const closeFilterMenu = () => {
    setFilterAnchor(null);
  };

  // =====================================================
  // SORT MENU
  // =====================================================

  const openSortMenu = (event) => {
    setSortAnchor(event.currentTarget);
  };

  const closeSortMenu = () => {
    setSortAnchor(null);
  };

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((candidate) => {
        return (
          candidate.name?.toLowerCase().includes(query) ||
          candidate.email?.toLowerCase().includes(query) ||
          candidate.appliedFor?.toLowerCase().includes(query) ||
          candidate.stage?.toLowerCase().includes(query) ||
          candidate.location?.toLowerCase().includes(query)
        );
      });
    }

    // -------------------------------------------------
    // STATUS TAB
    // -------------------------------------------------

    if (activeTab !== "All") {
      result = result.filter((candidate) => {
        const candidateStatus =
          candidate.status ||
          (candidate.stage === "Rejected" ? "Closed" : "Active");

        return candidateStatus === activeTab;
      });
    }

    // -------------------------------------------------
    // STAGE FILTER
    // -------------------------------------------------

    if (stageFilter !== "All") {
      result = result.filter((candidate) => candidate.stage === stageFilter);
    }

    // -------------------------------------------------
    // AI SCORE FILTER
    // -------------------------------------------------

    if (scoreFilter !== "All") {
      result = result.filter((candidate) => {
        if (scoreFilter === "90+") {
          return candidate.aiScore >= 90;
        }

        if (scoreFilter === "80-89") {
          return candidate.aiScore >= 80 && candidate.aiScore <= 89;
        }

        if (scoreFilter === "70-79") {
          return candidate.aiScore >= 70 && candidate.aiScore <= 79;
        }

        if (scoreFilter === "Below 70") {
          return candidate.aiScore < 70;
        }

        return true;
      });
    }

    // -------------------------------------------------
    // SORT
    // -------------------------------------------------

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortBy === "score-high") {
      result.sort((a, b) => b.aiScore - a.aiScore);
    }

    if (sortBy === "score-low") {
      result.sort((a, b) => a.aiScore - b.aiScore);
    }

    if (sortBy === "date-new") {
      result.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    }

    if (sortBy === "date-old") {
      result.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    }

    return result;
  }, [candidates, search, activeTab, stageFilter, scoreFilter, sortBy]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const pagedCandidates = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCandidates, page]);

  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleStageChange = (stage) => {
    setStageFilter(stage);
    setPage(1);
    closeFilterMenu();
  };

  const handleScoreChange = (score) => {
    setScoreFilter(score);
    setPage(1);
    closeFilterMenu();
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
    closeSortMenu();
  };

  // =====================================================
  // CLEAR FILTER
  // =====================================================

  const clearFilters = () => {
    setStageFilter("All");
    setScoreFilter("All");
    setPage(1);
    closeFilterMenu();
  };

  // =====================================================
  // STAGE DOTS
  // =====================================================

  const renderStageDots = (completed, total) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.4,
        flexShrink: 0,
      }}
    >
      {[...Array(total)].map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: i < completed ? "#1D293D" : "#D1D5DB",
          }}
        />
      ))}
    </Box>
  );

  // =====================================================
  // TABS
  // =====================================================

  const tabs = ["All", "Active", "Closed", "Draft"];

  // =====================================================
  // UI
  // =====================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            SEARCH / FILTER / SORT BAR
        ================================================= */}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mb: 1,
            px: {
              xs: 1,
              sm: 1.2,
              md: 1.4,
            },
            py: {
              xs: 0.8,
              sm: 0.9,
            },
            borderRadius: "10px",
            border: "1px solid #ECEEF2",
            bgcolor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {/* LEFT CONTROLS */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* SEARCH */}

            <TextField
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search jobs, candidates, positions..."
              size="small"
              InputProps={{
                startAdornment: (
                  <SearchOutlinedIcon
                    sx={{
                      fontSize: 14,
                      color: "#94A3B8",
                      mr: 0.7,
                    }}
                  />
                ),
              }}
              sx={{
                width: {
                  xs: 180,
                  sm: 240,
                  md: 310,
                },

                "& .MuiOutlinedInput-root": {
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "#F8FAFC",
                  fontSize: "0.65rem",

                  "& fieldset": {
                    borderColor: "#E8ECF1",
                  },

                  "&:hover fieldset": {
                    borderColor: "#CBD5E1",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#CBD5E1",
                  },
                },

                "& input": {
                  py: 0,
                },

                "& input::placeholder": {
                  color: "#94A3B8",
                  opacity: 1,
                },
              }}
            />

            {/* FILTER BUTTON */}

            <Button
              variant="outlined"
              size="small"
              startIcon={
                <FilterListOutlinedIcon
                  sx={{
                    fontSize: "13px !important",
                  }}
                />
              }
              onClick={openFilterMenu}
              sx={{
                height: 32,
                px: 1.1,
                borderRadius: "8px",
                textTransform: "none",
                color: "#64748B",
                borderColor: "#E2E8F0",
                fontSize: "0.65rem",
                fontWeight: 500,
                whiteSpace: "nowrap",

                "&:hover": {
                  borderColor: "#CBD5E1",
                  bgcolor: "#F8FAFC",
                },
              }}
            >
              Filters
            </Button>

            {/* SORT BUTTON */}

            <Button
              variant="outlined"
              size="small"
              startIcon={
                <SwapVertOutlinedIcon
                  sx={{
                    fontSize: "13px !important",
                  }}
                />
              }
              onClick={openSortMenu}
              sx={{
                height: 32,
                px: 1.1,
                borderRadius: "8px",
                textTransform: "none",
                color: "#64748B",
                borderColor: "#E2E8F0",
                fontSize: "0.65rem",
                fontWeight: 500,
                whiteSpace: "nowrap",

                "&:hover": {
                  borderColor: "#CBD5E1",
                  bgcolor: "#F8FAFC",
                },
              }}
            >
              Sort
            </Button>
          </Box>

          {/* =================================================
              STATUS TABS
          ================================================= */}

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab}
                onClick={() => handleTabChange(tab)}
                sx={{
                  minWidth: tab === "All" ? 34 : 40,

                  height: 25,

                  px: 0.9,

                  borderRadius: "14px",

                  textTransform: "none",

                  fontSize: "0.58rem",

                  fontWeight: activeTab === tab ? 700 : 500,

                  color: activeTab === tab ? "#FFFFFF" : "#64748B",

                  bgcolor: activeTab === tab ? "#0C3328" : "transparent",

                  "&:hover": {
                    bgcolor: activeTab === tab ? "#0C3328" : "#F1F5F9",
                  },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* =================================================
            FILTER MENU
        ================================================= */}

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={closeFilterMenu}
          PaperProps={{
            sx: {
              mt: 0.5,
              minWidth: 190,
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 25px rgba(15,23,42,0.10)",
            },
          }}
        >
          <Box sx={{ px: 1.5, py: 1 }}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#0F172B",
              }}
            >
              Filter Candidates
            </Typography>
          </Box>

          <Divider />

          <Typography
            sx={{
              px: 1.5,
              pt: 1,
              pb: 0.4,
              fontSize: "0.58rem",
              color: "#94A3B8",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Stage
          </Typography>

          {[
            "All",
            "HR Screening",
            "Technical Interview",
            "Final Interview",
            "Background Check",
            "Offer",
            "Rejected",
          ].map((stage) => (
            <MenuItem
              key={stage}
              selected={stageFilter === stage}
              onClick={() => handleStageChange(stage)}
              sx={{
                fontSize: "0.65rem",
                minHeight: 32,
              }}
            >
              {stage}
            </MenuItem>
          ))}

          <Divider />

          <Typography
            sx={{
              px: 1.5,
              pt: 1,
              pb: 0.4,
              fontSize: "0.58rem",
              color: "#94A3B8",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            AI Score
          </Typography>

          {["All", "90+", "80-89", "70-79", "Below 70"].map((score) => (
            <MenuItem
              key={score}
              selected={scoreFilter === score}
              onClick={() => handleScoreChange(score)}
              sx={{
                fontSize: "0.65rem",
                minHeight: 32,
              }}
            >
              {score}
            </MenuItem>
          ))}

          <Divider />

          <MenuItem
            onClick={clearFilters}
            sx={{
              fontSize: "0.65rem",
              color: "#DC2626",
              fontWeight: 600,
              minHeight: 34,
            }}
          >
            Clear Filters
          </MenuItem>
        </Menu>

        {/* =================================================
            SORT MENU
        ================================================= */}

        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={closeSortMenu}
          PaperProps={{
            sx: {
              mt: 0.5,
              minWidth: 180,
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 25px rgba(15,23,42,0.10)",
            },
          }}
        >
          <Box sx={{ px: 1.5, py: 1 }}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#0F172B",
              }}
            >
              Sort Candidates
            </Typography>
          </Box>

          <Divider />

          <MenuItem
            onClick={() => handleSortChange("name-asc")}
            sx={{
              fontSize: "0.65rem",
              minHeight: 34,
            }}
          >
            Name A → Z
          </MenuItem>

          <MenuItem
            onClick={() => handleSortChange("name-desc")}
            sx={{
              fontSize: "0.65rem",
              minHeight: 34,
            }}
          >
            Name Z → A
          </MenuItem>

          <MenuItem
            onClick={() => handleSortChange("score-high")}
            sx={{
              fontSize: "0.65rem",
              minHeight: 34,
            }}
          >
            AI Score High → Low
          </MenuItem>

          <MenuItem
            onClick={() => handleSortChange("score-low")}
            sx={{
              fontSize: "0.65rem",
              minHeight: 34,
            }}
          >
            AI Score Low → High
          </MenuItem>

          <MenuItem
            onClick={() => handleSortChange("date-new")}
            sx={{
              fontSize: "0.65rem",
              minHeight: 34,
            }}
          >
            Newest Applied
          </MenuItem>

          <MenuItem
            onClick={() => handleSortChange("date-old")}
            sx={{
              fontSize: "0.65rem",
              minHeight: 34,
            }}
          >
            Oldest Applied
          </MenuItem>
        </Menu>

        {/* =================================================
            MOBILE STATUS TABS
        ================================================= */}

        <Box
          sx={{
            display: {
              xs: "flex",
              sm: "none",
            },

            mb: 1,

            p: 0.5,

            borderRadius: "8px",

            bgcolor: "#FFFFFF",

            border: "1px solid #ECEEF2",

            gap: 0.4,
          }}
        >
          {tabs.map((tab) => (
            <Button
              key={tab}
              onClick={() => handleTabChange(tab)}
              sx={{
                flex: 1,

                minWidth: 0,

                height: 25,

                borderRadius: "13px",

                textTransform: "none",

                fontSize: "0.58rem",

                color: activeTab === tab ? "#FFFFFF" : "#64748B",

                bgcolor: activeTab === tab ? "#0C3328" : "transparent",

                "&:hover": {
                  bgcolor: activeTab === tab ? "#0C3328" : "#F8FAFC",
                },
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>

        {/* =================================================
            TABLE
        ================================================= */}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #ECEEF2",
            bgcolor: "#fff",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              width: "100%",
              tableLayout: "fixed",
              minWidth: 640,
            }}
          >
            {/* =================================================
                TABLE HEAD
            ================================================= */}

            <TableHead
              sx={{
                bgcolor: "#fff",
                borderBottom: "1px solid #ECEEF2",
              }}
            >
              <TableRow>
                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.candidate,
                  }}
                >
                  Candidate
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.appliedFor,
                  }}
                >
                  Applied For
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.stage,
                  }}
                >
                  Stage
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.aiScore,
                  }}
                >
                  AI Score
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.experience,
                    ...HIDE_ON_MD,
                  }}
                >
                  Experience
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.location,
                    ...HIDE_ON_SM,
                  }}
                >
                  Location
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.applied,
                    ...HIDE_ON_MD,
                  }}
                >
                  Applied
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellSx,
                    width: COL_WIDTHS.action,
                    textAlign: "right",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            {/* =================================================
                TABLE BODY
            ================================================= */}

            <TableBody>
              {pagedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{
                      textAlign: "center",
                      py: 6,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#94A3B8",
                        fontSize: "0.75rem",
                      }}
                    >
                      No candidates found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedCandidates.map((row, index) => (
                  <MotionTableRow
                    key={row.id || index}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    sx={{
                      "&:hover": {
                        bgcolor: "#F8FAFC",
                      },

                      borderBottom: "1px solid #F1F3F5",
                    }}
                  >
                    {/* CANDIDATE */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.candidate,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                          minWidth: 0,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: row.avatarBg || "#0C3328",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {row.name
                            ? row.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "C"}
                        </Avatar>

                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#111827",
                              lineHeight: 1.25,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.name}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "0.68rem",
                              color: "#6B7280",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* APPLIED FOR */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.appliedFor,
                        fontWeight: 500,
                      }}
                    >
                      {row.appliedFor}
                    </TableCell>

                    {/* STAGE */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.stage,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                          minWidth: 0,
                        }}
                      >
                        {renderStageDots(
                          row.completedDots || 0,
                          row.totalDots || 6,
                        )}

                        <Typography
                          sx={{
                            fontSize: "0.74rem",
                            color: "#374151",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.stage}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* AI SCORE */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.aiScore,
                        overflow: "visible",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.6,
                        }}
                      >
                        <Chip
                          label={row.aiScore}
                          size="small"
                          sx={{
                            height: 22,
                            minWidth: 30,
                            bgcolor: scoreColor(row.aiScore),
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            borderRadius: "10px",

                            "& .MuiChip-label": {
                              px: 0.9,
                            },
                          }}
                        />

                        <AutoAwesomeRoundedIcon
                          sx={{
                            fontSize: 13,
                            color: "#9333EA",
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* EXPERIENCE */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.experience,
                        ...HIDE_ON_MD,
                      }}
                    >
                      {row.experience}
                    </TableCell>

                    {/* LOCATION */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.location,
                        ...HIDE_ON_SM,
                      }}
                    >
                      {row.location}
                    </TableCell>

                    {/* APPLIED */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.applied,
                        ...HIDE_ON_MD,
                      }}
                    >
                      {row.appliedDate}
                    </TableCell>

                    {/* ACTION */}

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        width: COL_WIDTHS.action,
                        textAlign: "right",
                        overflow: "visible",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 0.3,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            color: "#2563EB",
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          sx={{
                            color: "#6B7280",
                          }}
                        >
                          <MoreHorizIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </MotionTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <CustomPagination
          page={page}
          totalItems={filteredCandidates.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Box>
    </motion.div>
  );
}
