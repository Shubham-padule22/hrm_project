import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Divider,
  Breadcrumbs,
  // Link,
} from "@mui/material";
import { Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from "@mui/icons-material/Add";
import { API_BASE_URL } from "../../Config/api";
import axiosInstance from "../../Config/axiosInstance";
import PremiumSnackbar from "../common/PremiumSnackbar";
import LeaveReq from "./LeaveReq";
import CustomPagination from "../common/Custompagination";
import LeaveApproveRejectModal from "./LeaveApproveRejectModal";
import { motion, AnimatePresence } from "framer-motion";
import { hasPermission } from "../common/permissionUtils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -15,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 15,
    transition: {
      duration: 0.2,
    },
  },
};

const sidebarVariants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const avatarColors1 = [
  "#3B82F6",
  "#10B981",
  "#3B82F6",
  "#8B5CF6"
];

const StatusChip = ({ status }) => {
  const styles = {
    Pending: {
      backgroundColor: "#fff4ce",
      color: "#e9a400",
    },
    Approved: {
      backgroundColor: "#d9f8e8",
      color: "#16a56b",
    },
    Rejected: {
      backgroundColor: "#ffe0e0",
      color: "#ef5555",
    },
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        ...styles[status],
        height: 20,
        fontSize: ".7rem",
        fontWeight: 600,
        borderRadius: "10px",
        "& .MuiChip-label": {
          px: 1,
        },
      }}
    />
  );
};

const LeaveManagement = () => {
  const canAddLeaveRequest = hasPermission(
    "Attendance",
    "Leave-Management",
    "Add-Request"
  );

  const canViewLeave = hasPermission(
    "Attendance",
    "Leave-Management",
    "View"
  );


  console.log(localStorage.getItem("token"));
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [leaveData, setLeaveData] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);
  const [clgid, setclgid] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpenAdd = () => {
    setOpen(true);
  };

  const getLeaveDashboard = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${API_BASE_URL}/hrm_web/LeaveDashBoard/`
      );

      const data = response.data || [];
      console.log(data, 'data');

      setclgid(data[0].clg_id)
      const mappedData = data.map((item) => ({
        name: [
          item.clg_first_name,
          item.clg_mid_name,
          item.clg_last_name,
        ]
          .filter(Boolean)
          .join(" "),
        leaveID: item.leaveID || "-",
        clg_id: item.clg_id || "-",
        subtitle: item.reason || "-",

        leaveType: item.leave_name || "-",

        period: `${formatDate(item.from_date)} - ${formatDate(item.to_date)}`,

        days: `${item.total_days}d`,

        applied: formatAppliedDate(item.applied_date),

        status:
          item.status === 1
            ? "Pending"
            : item.status === 2
              ? "Approved"
              : "Rejected",
      }));

      setLeaveData(mappedData);
    } catch (error) {
      console.error("Error fetching leave dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = leaveData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "All" || item.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  console.log(paginatedData, 'paginatedData');

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);
  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAppliedDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  //upcomming leaves
  const getUpcomingLeaves = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${API_BASE_URL}/hrm_web/UpcomingLeaves/`
      );

      const data = response.data?.data || [];

      const mappedData = data.map((item) => ({
        clg_id: item.clg_id,
        name: [
          item.clg_first_name,
          item.clg_mid_name,
          item.clg_last_name,
        ]
          .filter(Boolean)
          .join(" "),

        leaveType: item.leave_name || "-",

        fromDate: item.from_date,

        toDate: item.to_date,

        period: `${formatDate(item.from_date)} - ${formatDate(item.to_date)}`,
      }));

      setUpcomingLeaves(mappedData);
    } catch (error) {
      console.error("Error fetching upcoming leaves:", error);
      setUpcomingLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveSummary = async () => {
    try {
      setLoading(true);
      console.log('hghftf');

      const response = await axiosInstance.get(
        `${API_BASE_URL}/hrm_web/clg_wise_leave_details/?clg_id=${clgid}`
      );

      const data = response.data?.data || [];

      const colors = [
        "#00a884",
        "#3182f6",
        "#f59e0b",
        "#7c3aed",
        "#ef4444",
        "#06b6d4",
      ];
      const bgcolors = [
        "#D5F2E9",
        "#DEECFC",
        "#FEF2E0",
        "#F3EBFC",
      ];

      const mappedData = data.map((item, index) => ({
        title: item.leave_name || "-",
        color: colors[index % colors.length],
        bgcolors: bgcolors[index % bgcolors.length],
        used: Number(item.used) || 0,
        pending: Number(item.pending) || 0,
        left: Number(item.balance) || 0,
      }));

      setLeaveSummary(mappedData);
    } catch (error) {
      console.error("Error fetching leave summary:", error);
      setLeaveSummary([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getLeaveDashboard();
    getUpcomingLeaves();
  }, []);

  useEffect(() => {
    console.log(clgid, 'clgid');

    // if (!clgid) return;

    getLeaveSummary();
  }, [clgid]);

  //leave req drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const handleOpenDrawer = (leaveId) => {
    setSelectedLeaveId(leaveId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const leaveGridColumns = canViewLeave
    ? "1fr 1fr 1.5fr .5fr 1.15fr .7fr .55fr"
    : "1fr 1fr 1.5fr .5fr 1.15fr .7fr";
  const leaveMinWidth = canViewLeave ? 760 : 680;
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        p: { xs: 1.5, md: 2 },
        fontFamily: "Arial, sans-serif",
      }}
    >
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
            // component={RouterLink}
            to={'/Attendance-management'}
            style={{
              fontSize: "0.875rem",
              textDecoration: "none",
              color: "#626A75",
            }}
          >
            Attendance
          </Link>
          <Typography
            color="#1D293D"
            sx={{ fontSize: "0.875rem", fontWeight: 700 }}
          >
            Leave management
          </Typography>
        </Breadcrumbs>
      </motion.div>
      {/* MAIN GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) 25%",
            },
            gap: 1.5,
            maxWidth: "100%",
            mx: "auto",
          }}
        >
          {/* =====================================================
                    LEFT - LEAVE REQUESTS
                ====================================================== */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e8ebef",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {/* TOP TOOLBAR */}
              <Box
                sx={{
                  height: 58,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  gap: 1,
                }}
              >
                {/* Search */}
                <Box
                  sx={{
                    position: "relative",
                    width: {
                      xs: 150,
                      sm: 200,
                      md: 400,
                    },
                  }}
                >
                  <SearchIcon
                    sx={{
                      position: "absolute",
                      left: "0px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 2,
                      fontSize: "1.1rem",
                      color: "#fff",
                      backgroundColor: "#073b35",
                      borderRadius: "10px",
                      padding: "4px",
                      boxSizing: "content-box",
                      height: 23,
                      width: 23
                    }}
                  />

                  <TextField
                    size="small"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                      width: "100%",

                      "& .MuiOutlinedInput-root": {
                        height: 32,
                        borderRadius: "8px",
                        backgroundColor: "#f5f7fa",
                        fontSize: ".7rem",
                        paddingLeft: "35px",

                        "& fieldset": {
                          border: "none",
                        },
                      },

                      "& input": {
                        padding: "0 8px",
                      },
                    }}
                  />
                </Box>
                {/* Tabs + Add */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      display: "flex",
                      backgroundColor: "#f5f7fa",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    {["All", "Pending", "Approved", "Rejected"].map(
                      (tab) => (
                        <Button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          sx={{
                            minWidth: tab === "All" ? 30 : 48,
                            height: 30,
                            px: 1,
                            fontSize: ".7rem",
                            textTransform: "none",
                            fontWeight: 600,
                            color:
                              activeTab === tab
                                ? "#fff"
                                : "#5f6368",
                            backgroundColor:
                              activeTab === tab
                                ? "#13302C"
                                : "transparent",
                            borderRadius: "4px",
                            "&:hover": {
                              backgroundColor:
                                activeTab === tab
                                  ? "#13302C"
                                  : "#e8ecef",
                            },
                          }}
                        >
                          {tab}
                          {/* {tab === "Pending" && (
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            backgroundColor:
                              "#ff4d5a",
                            ml: 0.5,
                          }}
                        />
                      )} */}
                        </Button>
                      )
                    )}
                  </Box>

                  {canAddLeaveRequest && (<Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: '.7rem' }} />}
                    onClick={handleOpenAdd}
                    sx={{
                      height: 30,
                      minWidth: 90,
                      px: 1.2,
                      backgroundColor: "#e9233d",
                      borderRadius: "5px",
                      textTransform: "none",
                      fontSize: ".7rem",
                      fontWeight: 600,
                      boxShadow: "none",
                      "& .MuiButton-startIcon": {
                        marginRight: 0.3,
                        "& svg": {
                          fontSize:
                            '1.3vw',
                        },
                      },
                      "&:hover": {
                        backgroundColor: "#d91c34",
                        boxShadow: "none",
                      },
                    }}
                  >
                    New Request
                  </Button>)}
                </Stack>
              </Box>

              {/* TABLE */}
              <Box sx={{ overflowX: "auto" }}>
                {/* HEADER */}
                <Box
                  sx={{
                    minWidth: leaveMinWidth,
                    height: 27,
                    display: "grid",
                    gridTemplateColumns: leaveGridColumns,
                    alignItems: "center",
                    px: 1.5,
                    backgroundColor: "#f7f8fa",
                    borderTop: "1px solid #eef0f2",
                    borderBottom: "1px solid #eef0f2",
                  }}
                >
                  {[
                    "EMPLOYEE",
                    "LEAVE TYPE",
                    "PERIOD",
                    "DAYS",
                    "APPLIED ON",
                    "STATUS",
                    // "ACTIONS",
                    ...(canViewLeave ? ["ACTIONS"] : []),
                  ].map((heading) => (
                    <Typography
                      key={heading}
                      sx={{
                        fontSize: ".7rem",
                        fontWeight: 700,
                        color: "#74787d",
                        textAlign: 'center'
                      }}
                    >
                      {heading}
                    </Typography>
                  ))}
                </Box>

                {/* ROWS */}
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((item, index) => {
                    const actualIndex = (page - 1) * itemsPerPage + index;

                    return (
                      <motion.div
                        key={item.leaveID || actualIndex}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        whileHover={{
                          x: 3,
                          transition: {
                            duration: 0.15,
                          },
                        }}
                      >
                        <Box
                          onClick={() => {
                            setSelectedRow(actualIndex);
                            setclgid(item.clg_id);
                          }}
                          sx={{
                            minWidth: leaveMinWidth,
                            minHeight: 50,
                            textAlign: "center",
                            alignItems: "center",
                            display: "grid",
                            gridTemplateColumns: leaveGridColumns,
                            px: 1.5,

                            borderBottom: "1px solid #f0f1f3",

                            borderLeft:
                              selectedRow === actualIndex
                                ? "3px solid #13302C"
                                : "3px solid transparent",

                            cursor: "pointer",

                            backgroundColor:
                              selectedRow === actualIndex
                                ? "#f5faf8"
                                : "#fff",

                            "&:hover": {
                              backgroundColor:
                                selectedRow === actualIndex
                                  ? "#f5faf8"
                                  : "#fafcfc",
                            },

                            transition: "background-color 0.2s ease",
                          }}
                        >
                          {/* Employee */}
                          <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 21,
                                height: 21,
                                fontSize: ".5rem",
                                fontWeight: 700,
                                backgroundColor: "#0C3328",
                                color: "#fff",
                                textTransform: "capitalize",

                              }}
                            >
                              {item.name
                                .split(" ")
                                .map((x) => x[0])
                                .join("")
                                .slice(0, 2)}
                            </Avatar>

                            <Box>
                              <Typography
                                sx={{
                                  fontSize: ".7rem",
                                  fontWeight: 700,
                                  color: "#24272b",
                                  lineHeight: 1.5,
                                  textTransform: "capitalize",
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: ".5rem",
                                  color: "#999da2",
                                  lineHeight: 1.2,
                                  textAlign: 'left'
                                }}
                              >
                                {item.subtitle}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Leave type */}
                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              color: "#55595e",
                            }}
                          >
                            {item.leaveType}
                          </Typography>

                          {/* Period */}
                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              color: "#55595e",
                            }}
                          >
                            {item.period}
                          </Typography>

                          {/* Days */}
                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              fontWeight: 600,
                              color: "#333",
                            }}
                          >
                            {item.days}
                          </Typography>

                          {/* Applied */}
                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              color: "#55595e",
                            }}
                          >
                            {item.applied}
                          </Typography>

                          {/* Status */}
                          <Box>
                            <StatusChip status={item.status} />
                          </Box>

                          {/* Action */}
                          {/* <Typography
                    onClick={handleOpenDrawer}
                    sx={{
                      fontSize: ".7rem",
                      color: "#555",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#DC1F30", // optional hover highlight
                      },
                    }}
                  >
                    View
                  </Typography> */}
                          {canViewLeave && (
                            <Typography
                            // onClick={handleOpenDrawer}
                            onClick={() => handleOpenDrawer(item.leaveID)}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              px: 1.5,
                              py: 0.6,
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#344054",
                              backgroundColor: "#F2F4F7",
                              borderRadius: "20px",
                              cursor: "pointer",
                              transition: "all 0.2s ease-in-out",
                              "& .MuiSvgIcon-root": {
                                fontSize: "15px",
                                color: "#667085",
                                transition: "color 0.2s ease",
                              },
                              "&:hover": {
                                backgroundColor: "#FEF2F2",
                                color: "#DC1F30",
                                transform: "translateY(-1px)",
                                "& .MuiSvgIcon-root": {
                                  color: "#DC1F30",
                                },
                              },
                              "&:active": {
                                transform: "translateY(0)",
                              },
                            }}
                          >
                            <VisibilityOutlinedIcon />
                            View
                          </Typography>
                          )}
                        </Box>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <CustomPagination
                  page={page}
                  totalItems={filteredData.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(nextPage) => {
                    setPage(nextPage);
                    setSelectedRow((nextPage - 1) * itemsPerPage);
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
          {/* =====================================================
                    RIGHT SIDEBAR
                ====================================================== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Stack spacing={1} sx={{ mb: 2 }}>
              {/* UPCOMING LEAVES */}
              <motion.div
                variants={sidebarVariants}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #e6e9ed",
                    borderRadius: "8px",
                    p: 1,
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: ".7rem",
                      fontWeight: 700,
                      color: "#31353a",
                      mb: 1,
                    }}
                  >
                    Upcoming Leaves
                  </Typography>

                  <Stack spacing={0.9}>
                    {upcomingLeaves.length > 0 ? (
                      upcomingLeaves.map((leave, index) => (
                        <Box
                          key={leave.id || index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: 40,
                            width: "100%",
                            pl: 1.5, // Thoda left padding border se distance ke liye
                            py: 0.5,
                            backgroundColor: "#fff",
                            borderRadius: "0px",
                            position: "relative", // Required for absolute positioning of pseudo-element
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)", // Vertically center align
                              height: "60%", // Border ki height (Apne hisab se %, px, ya rem de sakte ho)
                              width: "4px", // Border ki thickness
                              backgroundColor: avatarColors1[index % avatarColors1.length],
                              borderRadius: "2px", // Thoda rounded Look dene ke liye (optional)
                            },
                          }}

                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                fontWeight: 600,
                                lineHeight: 1.2,
                                textTransform: "capitalize",
                              }}
                            >
                              {leave.name}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: ".6rem",
                                color: "#999",
                                lineHeight: 1.2,
                              }}
                            >
                              {leave.period?.replace(/,?\s*\d{4}/g, "")} · {leave.leaveType}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.4,
                        }}
                      >
                        <Box
                          sx={{
                            minHeight: 100,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            border: "1px dashed #d9e0e7",
                            py: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              backgroundColor: "#e8f5f1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 0.7,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "1rem",
                                color: "#13302C",
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              fontWeight: 700,
                              color: "#31353a",
                            }}
                          >
                            No upcoming leaves
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              color: "#9aa1a8",
                              mt: 0.3,
                            }}
                          >
                            Everyone is available for the upcoming days
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Stack>
                </Paper>
              </motion.div>
              {/* LEAVE SUMMARY */}
              <AnimatePresence>
                {leaveSummary.map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={sidebarVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      delay: index * 0.08,
                    }}
                    whileHover={{
                      y: -3,
                      scale: 1.01,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                  >
                    <Paper
                      key={item.title}
                      elevation={0}
                      sx={{
                        border: "1px solid #e6e9ed",
                        borderRadius: "8px",
                        p: 2,
                        backgroundColor: `${item.bgcolors}`,
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "5px",
                              backgroundColor: `${item.color}20`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                fontWeight: 700,
                                color: item.color,
                              }}
                            >
                              {item.title[0] + "L"}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: ".7rem",
                              fontWeight: 700,
                            }}
                          >
                            {item.title}
                          </Typography>
                        </Stack>

                        <Typography
                          sx={{
                            fontSize: ".7rem",
                            color: item.color,
                            fontWeight: 700,
                          }}
                        >
                          Left: {item.left}
                        </Typography>
                      </Stack>

                      {/* Progress */}
                      <Box
                        sx={{
                          height: 4,
                          backgroundColor: "#edf0f2",
                          borderRadius: 5,
                          overflow: "hidden",
                          mb: 0.6,
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: "easeOut",
                          }}
                          style={{
                            height: "100%",
                            backgroundColor: item.color,
                            borderRadius: 5,
                          }}
                        />
                      </Box>

                      <Stack direction="row" spacing={3}
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}>
                        <Typography
                          sx={{
                            fontSize: ".7rem",
                            color: "#999",
                          }}
                        >
                          Used: {item.used}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: ".7rem",
                            color: "#e55",
                            fontWeight: '700'
                          }}
                        >
                          Pending: {item.pending}
                        </Typography>
                      </Stack>
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </motion.div>
        </Box>
      </motion.div >
      <LeaveReq
        open={open}
        handleClose={handleClose}
        setSnackbar={setSnackbar}
        getLeaveDashboard={getLeaveDashboard}
      />
      <LeaveApproveRejectModal
        open={drawerOpen}
        onClose={handleCloseDrawer}
        data={selectedRow}
        leaveId={selectedLeaveId}
      />
      <PremiumSnackbar
        open={snackbar.open}
        setOpen={(open) =>
          setSnackbar((prev) => ({
            ...prev,
            open,
          }))
        }
        type={snackbar.type}
        title={snackbar.title}
        message={snackbar.message}
      />
    </Box >
  );
};

export default LeaveManagement;