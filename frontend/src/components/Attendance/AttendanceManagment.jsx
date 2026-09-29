import React, { useState, useMemo, useEffect } from "react";
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
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { hasPermission } from "../common/permissionUtils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RequestCorrection from "./RequestCorrection";
import axios from "axios";
import { API_BASE_URL } from "../../Config/api";
import CustomPagination from "../common/Custompagination";
import AttendanceDetailsDrawer from "./AttendanceDetailsDrawer";
import PremiumSnackbar from "../common/PremiumSnackbar";
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import LocationTracking from "./LocationTracking";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const statusStyles = {
  Present: {
    color: "#16A34A",
    background: "#E8FFF1",
    dot: "#22C55E",
  },
  Late: {
    color: "#D99100",
    background: "#FFF5D9",
    dot: "#FBBF24",
  },
  "On Break": {
    color: "#2563EB",
    background: "#EAF2FF",
    dot: "#3B82F6",
  },
  "Half Day": {
    color: "#2563EB",
    background: "#EAF2FF",
    dot: "#3B82F6",
  },
  Absent: {
    color: "#DC2626",
    background: "#FFECEC",
    dot: "#EF4444",
  },
};

const StatusChip = ({ status }) => {
  // const style = statusStyles[status];
  const style = statusStyles[status] || {
    color: "#64748B",
    background: "#F1F5F9",
    dot: "#94A3B8",
  };

  return (
    <Chip
      size="small"
      label={
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.45}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: style.dot,
            }}
          />

          <Typography
            sx={{
              fontSize: ".8rem",
              lineHeight: 1,
              fontWeight: 600,
              color: style.color,
            }}
          >
            {status}
          </Typography>
        </Stack>
      }
      sx={{
        height: 16,
        borderRadius: "8px",
        backgroundColor: style.background,
        "& .MuiChip-label": {
          px: 0.8,
          py: 0,
        },
      }}
    />
  );
};

const EmployeeCell = ({ row }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.7}
    sx={{ padding: '.6rem' }}
  >
    <Avatar
      sx={{
        width: 25,
        height: 25,
        fontSize: ".7rem",
        fontWeight: 600,
        backgroundColor: row.avatarColor,
      }}
    >
      {row.avatar}
    </Avatar>

    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: ".7rem",
          fontWeight: 600,
          color: "#1F2937",
          lineHeight: 1.15,
          whiteSpace: "nowrap",
        }}
      >
        {row.name}
      </Typography>

      <Typography
        sx={{
          fontSize: ".5rem",
          color: "#A0A8B4",
          lineHeight: 1.2,
          mt: "2px",
        }}
      >
        {row.id}
      </Typography>
    </Box>
  </Stack>
);

//calender
// const attendanceDataCalender = {
//   // Present
//   1: "present",
//   2: "present",
//   3: "present",
//   4: "present",
//   7: "present",
//   9: "present",
//   10: "present",
//   11: "present",
//   16: "present",
//   17: "present",
//   18: "present",
//   21: "present",
//   22: "present",
//   23: "present",

//   // Leave
//   14: "leave",
//   15: "leave",

//   // Selected
//   24: "selected",

//   // Example:
//   // 8: "late",
//   // 12: "absent",
// };
const statusStyles1 = {
  present: {
    background: "#CFF7E5",
    color: "#17202A",
  },

  late: {
    background: "#FFF1C7",
    color: "#17202A",
  },

  absent: {
    background: "#F9DDDD",
    color: "#17202A",
  },

  leave: {
    background: "#E9E3F8",
    color: "#17202A",
  },

  selected: {
    background: "#073B31",
    color: "#FFFFFF",
  },
};

const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


// Get number of days in month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};


// Monday based index
const getFirstDayIndex = (year, month) => {
  const day = new Date(year, month, 1).getDay();

  // Sunday = 0
  // Monday = 0
  return day === 0 ? 6 : day - 1;
};


const LegendItem = ({ color, label }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.55}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "4px",
          backgroundColor: color,
          border: "1px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontSize: {
            xs: "12px",
            sm: ".7rem",
          },
          color: "#98A2B3",
          lineHeight: 1,
          fontWeight: 400,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};



const AttendanceManagment = () => {
  const canRequestCorrection = hasPermission(
    "Attendance",
    "Attendance-management",
    "Request-Correction"
  );

  const canViewAttendance = hasPermission(
    "Attendance",
    "Attendance-management",
    "View-Attendance"
  );

  const canAttendanceApproval = hasPermission(
    "Attendance",
    "Attendance-management",
    "Attendance-Approval"
  );
  //todays get data
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceData1, setAttendanceData1] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAttendanceDrawer, setOpenAttendanceDrawer] = useState(false);
  const [openTrackingDrawer, setOpenTrackingDrawer] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const handleOpenAttendanceDrawer = (row) => {
    setSelectedAttendance(row);
    setOpenAttendanceDrawer(true);
  };

  const handleCloseAttendanceDrawer = () => {
    setOpenAttendanceDrawer(false);
    setSelectedAttendance(null);
  };

  const handleOpenTrackingDrawer = (row) => {
    setSelectedAttendance(row);
    setOpenTrackingDrawer(true);
  };

  const handleCloseTrackingDrawer = () => {
    setOpenTrackingDrawer(false);
    setSelectedAttendance(null);
  };

  const getAttendanceData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/hrm_web/attendance_get/`
      );

      if (response.data?.status) {
        const apiData = response.data.data || [];

        const mappedData = apiData.map((item, index) => ({
          attendanceId: item.attendance_id,
          emp_id: item.employee,
          name: item.employee_name || "—",
          id: item.employee_code || "_",
          attendanceDate: item.attendance_date || "",
          firstLogin: item.first_login || "",
          lastLogout: item.last_logout || "",
          remarks: item.remarks || "",
          attendanceStatus: item.attendance_status || "present",
          department: item.department_name || "—",

          clockIn: formatTime(item.first_login),
          clockOut: formatTime(item.last_logout),

          ot: formatHours(item.overtime_hours),
          break: formatBreakTime(item.break_time),
          hours: formatHours(item.working_hours),

          status: formatAttendanceStatus(item),

          avatar: getInitials(item.employee_name),
          avatarColor: getAvatarColor(index),
        }));
        setSelectedEmployeeId(mappedData[0]?.emp_id);
        setAttendanceData1(mappedData);
      } else {
        setAttendanceData1([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData1([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAttendanceData();
    getTodayAttendanceCount();
  }, []);
  const filteredAttendanceData = useMemo(() => {
    return attendanceData1.filter((row) => {
      const search = searchText.trim().toLowerCase();

      const matchesSearch =
        !search ||
        row.name?.toLowerCase().includes(search) ||
        row.id?.toLowerCase().includes(search) ||
        row.department?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        row.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [attendanceData1, searchText, statusFilter]);
  const paginatedAttendanceData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredAttendanceData.slice(
      startIndex,
      endIndex
    );
  }, [filteredAttendanceData, page, itemsPerPage]);
  useEffect(() => {
    setPage(1);
  }, [searchText, statusFilter]);
  const formatTime = (dateTime) => {
    if (!dateTime) return "—";

    const date = new Date(dateTime);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatHours = (hours) => {
    if (hours === null || hours === undefined || hours === "") {
      return "—";
    }

    const numericHours = Number(hours);

    if (Number.isNaN(numericHours)) {
      return hours;
    }

    return `${numericHours}h`;
  };

  const formatBreakTime = (breakTime) => {
    if (breakTime === null || breakTime === undefined || breakTime === "") {
      return "0h";
    }

    return breakTime;
  };

  const formatAttendanceStatus = (item) => {
    const status = item.attendance_status?.toLowerCase();

    if (status === "absent") return "Absent";

    if (status === "half_day") return "Half Day";

    // if (status === "present" && Number(item.late_minutes) > 0) {
    //   return "Late";
    // }

    if (status === "present") return "Present";

    if (status === "on_break") return "On Break";

    if (status === "leave") return "Leave";

    return "—";
  };

  const getInitials = (name) => {
    if (!name) return "—";

    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      "#5B8DEF",
      "#8B5CF6",
      "#94A3B8",
      "#64748B",
      "#14B8A6",
      "#9CA3AF",
      "#F59E0B",
      "#6366F1",
    ];

    return colors[index % colors.length];
  };


  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayIndex(year, month);

  const previousMonthDays = getDaysInMonth(
    year,
    month - 1
  );

  const days = [];

  // -----------------------------------------
  // Previous month dates
  // -----------------------------------------

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: previousMonthDays - i,
      currentMonth: false,
      type: "previous",
    });
  }

  // -----------------------------------------
  // Current month dates
  // -----------------------------------------

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      currentMonth: true,
      type: "current",
    });
  }

  // -----------------------------------------
  // Next month dates
  // -----------------------------------------

  let nextDay = 1;

  while (days.length % 7 !== 0) {
    days.push({
      day: nextDay++,
      currentMonth: false,
      type: "next",
    });
  }


  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };


  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };
  //request correction
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    setSelectedAttendance(null);
  };
  const handleOpenAdd = () => {
    setOpen(true);
  };
  // console.log(localStorage.getItem("token"));


  //calender

  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const getMonthlyAttendance = async () => {
    try {
      setMonthlyLoading(true);


      const response = await axios.get(
        `${API_BASE_URL}/hrm_web/attendance_month/`,
        {
          params: {
            employee_id: selectedEmployeeId,
            month: month + 1,
            year: year,
          },
        }
      );

      if (response.data?.status) {
        setMonthlyAttendance(response.data.data || []);
      } else {
        setMonthlyAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      setMonthlyAttendance([]);
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    getMonthlyAttendance();
    const employeeId = 1;
  }, [year, month, selectedEmployeeId]);

  const attendanceDataCalender = useMemo(() => {
    const calendarData = {};

    monthlyAttendance.forEach((item) => {
      const date = new Date(item.date);

      // Make sure we only map the currently displayed month
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month
      ) {
        return;
      }

      const day = date.getDate();

      switch (item.status?.toLowerCase()) {
        case "present":
          calendarData[day] = "present";
          break;

        case "absent":
          calendarData[day] = "absent";
          break;

        case "on leave":
          calendarData[day] = "leave";
          break;

        default:
          break;
      }
    });

    return calendarData;
  }, [monthlyAttendance, year, month]);

  //top cards
  const [todayAttendanceCount, setTodayAttendanceCount] = useState({
    present: 0,
    late: 0,
    absent: 0,
    onLeave: 0,
    shiftcov: 0,
    avgclk: 0,
    overtimehr: 0
  });
  const getTodayAttendanceCount = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/hrm_web/Today_dash_count/`
      );

      console.log("Today Dashboard Count:", response.data);

      if (response.data?.status) {
        const data = response.data.data || {};

        setTodayAttendanceCount({
          present: data.present_employees || 0,
          late: data.late_employees || 0,
          absent: data.absent_employees || 0,
          onLeave: data.on_leave_employees || 0,
          shiftcov: data.shift_coverage_percentage || 0,
          avgclk: data.avg_clock_in_time || 0,
          overtimehr: data.overtime_hours || 0,
        });
      }
    } catch (error) {
      console.error(
        "Error fetching today's attendance count:",
        error
      );
    }
  };

  const attendanceData = [
    {
      value: todayAttendanceCount.present,
      label: "Present today",
      icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
      bgColor: "#D1FAE5",
      iconColor: "#16A34A",
    },
    {
      value: todayAttendanceCount.late,
      label: "Late today",
      icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
      bgColor: "#FEF3C7",
      iconColor: "#F59E0B",
    },
    {
      value: todayAttendanceCount.absent,
      label: "Absent today",
      icon: <CancelIcon sx={{ fontSize: 20 }} />,
      bgColor: "#FEE2E2",
      iconColor: "#EF4444",
    },
    {
      value: todayAttendanceCount.onLeave,
      label: "On Leave today",
      icon: <BeachAccessIcon sx={{ fontSize: 20 }} />,
      bgColor: "#EDE9FE",
      iconColor: "#8B5CF6",
    },
  ];
  const summaryData = [
    {
      label: "Shift Coverage",
      value: todayAttendanceCount.shiftcov,
      color: "#00B878",
    },
    {
      label: "Avg Clock In",
      value: todayAttendanceCount.avgclk,
      color: "#3B82F6",
    },
    {
      label: "Overtime Hours",
      value: todayAttendanceCount.overtimehr,
      color: "#F59E0B",
    },
    // {
    //   label: "GPS Verified",
    //   value: "98.2%",
    //   color: "#00B878",
    // },
  ];
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });


  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleRequestCorrection = (row) => {
    // Store selected employee if required
    setSelectedAttendance(row);

    // Close 3-dot menu
    handleMenuClose();

    // Open same RequestCorrection modal
    handleOpenAdd();
  };
  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "auto%", pt: 0, pb: 6 }}>
      <Container maxWidth="100%">
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
              Attendance
            </Link>
            <Typography
              color="#1D293D"
              sx={{ fontSize: "0.875rem", fontWeight: 700 }}
            >
              Attendance management
            </Typography>
          </Breadcrumbs>
        </motion.div>

        <Grid container spacing={2}>
          <Grid item xs={12} size={9}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 1.5,
                width: "100%",
              }}
            >
              {attendanceData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                  }}
                  style={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      height: 62,
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8EAF2",
                      borderRadius: "7px",
                      px: 1.25,
                      display: "flex",
                      alignItems: "center",
                      boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.04)",
                      transition: "box-shadow 0.25s ease",
                      "&:hover": {
                        boxShadow: "0px 6px 18px rgba(16, 24, 40, 0.10)",
                      },
                    }}
                  >
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        minWidth: 28,
                        borderRadius: "7px",
                        backgroundColor: item.bgColor,
                        color: item.iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1,
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* Content */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          lineHeight: 1.1,
                          color: "#0F1726",
                        }}
                      >
                        {item.value}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: ".8rem",
                          fontWeight: 400,
                          lineHeight: 1.3,
                          color: "#7A8494",
                          mt: 0.3,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>

            {/* search */}
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                borderRadius: "9px",
                border: "1px solid #E9EDF2",
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
                boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
                mt: 1
              }}
            >
              {/* ================= TOOLBAR ================= */}
              <Box
                sx={{
                  height: 40,
                  px: 1.1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #F0F2F5",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.55}
                >
                  {/* Search */}
                  <TextField
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search employee..."
                    size="small"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <SearchIcon
                          sx={{
                            fontSize: 10,
                            color: "#A1A9B5",
                            mr: 0.45,
                          }}
                        />
                      ),
                    }}
                    sx={{
                      width: 206,

                      "& .MuiOutlinedInput-root": {
                        height: 26,
                        borderRadius: "4px",
                        backgroundColor: "#FFFFFF",
                        fontSize: ".8rem",
                      },

                      "& .MuiOutlinedInput-input": {
                        padding: "3px 4px",
                        fontSize: ".8rem",
                      },

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E6E9EE",
                      },

                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D7DCE3",
                      },

                      "& input::placeholder": {
                        fontSize: ".7rem",
                        color: "#A6ADB7",
                        opacity: 1,
                      },
                    }}
                  />

                  {/* All Filter */}
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      width: 80,
                      height: 26,
                      fontSize: ".8rem",
                      borderRadius: "4px",

                      "& .MuiSelect-select": {
                        py: 0,
                        px: 0.8,
                        display: "flex",
                        alignItems: "center",
                      },

                      "& .MuiSvgIcon-root": {
                        fontSize: ".8rem",
                        right: 3,
                      },

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E6E9EE",
                      },
                    }}
                  >
                    <MenuItem value="all" sx={{ fontSize: ".8rem" }}>
                      All
                    </MenuItem>

                    <MenuItem value="present" sx={{ fontSize: ".8rem" }}>
                      Present
                    </MenuItem>
                    {/* <MenuItem value="half day" sx={{ fontSize: ".8rem" }}>
                      Half Day
                    </MenuItem>
                    <MenuItem value="late" sx={{ fontSize: ".8rem" }}>
                      Late
                    </MenuItem> */}

                    <MenuItem value="absent" sx={{ fontSize: ".8rem" }}>
                      Absent
                    </MenuItem>
                  </Select>

                  {/* Request Correction */}
                  {canRequestCorrection && (<Button
                    variant="outlined"
                    size="small"
                    sx={{
                      height: 26,
                      minWidth: 0,
                      px: 0.75,
                      borderRadius: "4px",
                      borderColor: "#E6E9EE",
                      color: "#374151",
                      textTransform: "none",
                      fontSize: ".7rem",
                      lineHeight: 1,

                      "&:hover": {
                        borderColor: "#D5DAE1",
                        backgroundColor: "#FAFBFC",
                      },
                    }}
                    onClick={handleOpenAdd}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: ".8rem",
                        mr: 0.35,
                      }}
                    >
                      ↗
                    </Typography>

                    Request Correction
                  </Button>)}
                </Stack>

                {/* Export */}
                {/* <Button
                  variant="contained"
                  disableElevation
                  startIcon={
                    <FileDownloadOutlinedIcon
                      sx={{ fontSize: ".8rem !important" }}
                    />
                  }
                  sx={{
                    height: 26,
                    minWidth: 54,
                    px: 0.8,
                    borderRadius: "5px",
                    backgroundColor: "#EF3340",
                    textTransform: "none",
                    fontSize: ".7rem",
                    fontWeight: 600,

                    "& .MuiButton-startIcon": {
                      marginRight: "2px",
                      marginLeft: 0,
                    },

                    "&:hover": {
                      backgroundColor: "#DC2633",
                    },
                  }}
                >
                  Export CSV
                </Button> */}
              </Box>

              {/* ================= TABLE ================= */}
              <TableContainer>
                <Table
                  sx={{
                    tableLayout: "fixed",
                    minWidth: 700,
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        height: 35,
                        backgroundColor: "#FAFBFC",
                      }}
                    >
                      <TableCell
                        sx={{
                          width: "20%",
                          py: 0,
                          px: 1,
                        }}
                      >
                        <HeaderText>Employee</HeaderText>
                      </TableCell>

                      <TableCell
                        sx={{
                          width: "10%",
                          py: 0,
                          px: 0.5,
                        }}
                      >
                        <HeaderText>Department</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "10%", py: 0, px: 0.5 }}>
                        <HeaderText>Clock In</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "10%", py: 0, px: 0.5 }}>
                        <HeaderText>Clock Out</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "15%", py: 0, px: 0.5 }}>
                        <HeaderText>Additional Hrs</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "10%", py: 0, px: 0.5 }}>
                        <HeaderText>Break Hrs</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "9%", py: 0, px: 0.5 }}>
                        <HeaderText>Hours</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "11%", py: 0, px: 0.5 }}>
                        <HeaderText>Status</HeaderText>
                      </TableCell>
                      <TableCell sx={{ width: "8%", py: 0, px: 0.5 }}>
                        <HeaderText>Map</HeaderText>
                      </TableCell>

                      <TableCell sx={{ width: "7%", py: 0, px: 0 }}>
                        <HeaderText>Action</HeaderText>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedAttendanceData?.map((row, index) => (
                        <motion.tr
                          key={row.id}
                          initial={{
                            opacity: 0,
                            x: -15,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: 15,
                          }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.04,
                            ease: "easeOut",
                          }}
                          onClick={() => setSelectedEmployeeId(row.emp_id)}
                          style={{
                            cursor: "pointer",
                            padding: '2rem',
                            backgroundColor:
                              selectedEmployeeId === row.emp_id
                                ? "#EAFBF4"
                                : "#FFFFFF",
                            borderLeft:
                              selectedEmployeeId === row.emp_id
                                ? "3px solid #00B878"
                                : "3px solid transparent",
                                
                          }}
                        >
                          {/* Employee */}
                          <TableCell sx={{ py: 0, px: 1 }}>
                            <EmployeeCell row={row} />
                          </TableCell>

                          {/* Department */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                lineHeight: 1.25,
                                color: "#475467",
                                maxWidth: 75,
                              }}
                            >
                              {row.department}
                            </Typography>
                          </TableCell>

                          {/* Clock In */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                color: row.status === "Late" ? "#F59E0B" : "#475467",
                                fontWeight: row.status === "Late" ? 600 : 400,
                              }}
                            >
                              {row.clockIn}
                            </Typography>
                          </TableCell>

                          {/* Clock Out */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                color: "#475467",
                              }}
                            >
                              {row.clockOut}
                            </Typography>
                          </TableCell>

                          {/* OT */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                color: "#475467",
                              }}
                            >
                              {row.ot}
                            </Typography>
                          </TableCell>

                          {/* Break */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                color: row.break === "22m" ? "#EF4444" : "#475467",
                                fontWeight: row.break === "22m" ? 600 : 400,
                              }}
                            >
                              {row.break}
                            </Typography>
                          </TableCell>

                          {/* Hours */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: ".7rem",
                                color: row.hours === "22m" ? "#EF4444" : "#475467",
                                fontWeight: row.hours === "22m" ? 600 : 400,
                              }}
                            >
                              {row.hours}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 0, px: 0.5 }}>
                            <StatusChip status={row.status} />
                          </TableCell>

                          {/* Map */}
                          <TableCell
                            sx={{ py: 0, px: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTrackingDrawer(row);
                            }}
                          >
                            <RoomOutlinedIcon sx={{ color: "#64748B" }} />
                          </TableCell>

                          {/* More */}
                          {/* <TableCell
                            align="center"
                            sx={{
                              py: 0,
                              px: 0,
                            }}
                          >
                            <IconButton
                              size="medium"
                              sx={{
                                width: 18,
                                height: 18,
                                color: "#A7AFBA",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAttendanceDrawer(row);
                              }}
                            >
                              <RemoveRedEyeOutlinedIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                          </TableCell> */}
                          <TableCell
                            align="center"
                            sx={{
                              py: 0,
                              px: 0,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, row)}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                color: "#697386",
                                transition: "all 0.2s ease",

                                "&:hover": {
                                  backgroundColor: "#F1F5F9",
                                  color: "#0A3D31",
                                },
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: "20px" }} />
                            </IconButton>

                            <Menu
                              anchorEl={anchorEl}
                              open={menuOpen}
                              onClose={handleMenuClose}
                              onClick={(e) => e.stopPropagation()}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              PaperProps={{
                                sx: {
                                  mt: 0.8,
                                  minWidth: 220,
                                  borderRadius: "12px",
                                  border: "1px solid #E8ECF0",
                                  backgroundColor: "#FFFFFF",

                                  boxShadow:
                                    "0px 8px 24px rgba(15, 23, 42, 0.12), 0px 2px 6px rgba(15, 23, 42, 0.06)",

                                  overflow: "hidden",
                                  padding: "6px",
                                },
                              }}
                            >
                              {/* View Attendance */}
                              {canViewAttendance && (<MenuItem
                                onClick={() => {
                                  handleOpenAttendanceDrawer(selectedRow);
                                  handleMenuClose();
                                }}
                                sx={{
                                  borderRadius: "8px",
                                  minHeight: "42px",
                                  px: 1.5,
                                  gap: 1.5,
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#344054",

                                  "&:hover": {
                                    backgroundColor: "#F0FDF9",
                                    color: "#0A3D31",

                                    "& .menu-icon": {
                                      color: "#00A878",
                                    },
                                  },
                                }}
                              >
                                <VisibilityOutlinedIcon
                                  className="menu-icon"
                                  sx={{
                                    fontSize: "19px",
                                    color: "#667085",
                                    transition: "0.2s",
                                  }}
                                />

                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    View Attendance Log
                                  </Typography>
                                </Box>
                              </MenuItem>
                              )}
                              {/* Request Correction */}
                              {canAttendanceApproval && (<MenuItem
                                onClick={() => {
                                  handleRequestCorrection(selectedRow);
                                }}
                                sx={{
                                  borderRadius: "8px",
                                  minHeight: "42px",
                                  px: 1.5,
                                  gap: 1.5,
                                  mt: 0.5,
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#344054",

                                  "&:hover": {
                                    backgroundColor: "#FFF7ED",
                                    color: "#C2410C",

                                    "& .menu-icon": {
                                      color: "#F97316",
                                    },
                                  },
                                }}
                              >
                                <EditOutlinedIcon
                                  className="menu-icon"
                                  sx={{
                                    fontSize: "19px",
                                    color: "#667085",
                                    transition: "0.2s",
                                  }}
                                />

                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    Attendance Approval
                                  </Typography>
                                </Box>
                              </MenuItem>)}
                            </Menu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
              <CustomPagination
                page={page}
                totalItems={filteredAttendanceData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            </Paper>
          </Grid>
          <Grid item sx={12} size={3}>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: "auto",

                minHeight: {
                  xs: "auto",
                  sm: "auto",
                },
                boxSizing: "border-box",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E7EAF0",
                borderRadius: "20px",
                boxShadow:
                  "0px 2px 8px rgba(16, 24, 40, 0.04)",
                px: {
                  xs: "25px",
                  sm: "26px",
                },
                pt: {
                  xs: "29px",
                  sm: ".8rem",
                },

                pb: "18px",
              }}
            >
              {/* =====================================================
                HEADER
            ===================================================== */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",

                  height: "39px",

                  mb: "17px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: "27px",
                      sm: "1rem",
                    },

                    fontWeight: 700,

                    lineHeight: 1,

                    letterSpacing: "-0.7px",

                    color: "#17202A",
                  }}
                >
                  {months[month]} {year}
                </Typography>


                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    mr: "-2px",
                  }}
                >
                  <IconButton
                    onClick={previousMonth}
                    disableRipple
                    sx={{
                      width: "20px",
                      height: "24px",
                      p: 0,

                      color: "#64748B",

                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <ChevronLeftIcon
                      sx={{
                        fontSize: "1.5rem",
                      }}
                    />
                  </IconButton>


                  <IconButton
                    onClick={nextMonth}
                    disableRipple
                    sx={{
                      width: "20px",
                      height: "24px",
                      p: 0,

                      color: "#64748B",

                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <ChevronRightIcon
                      sx={{
                        fontSize: "1.5rem",
                      }}
                    />
                  </IconButton>
                </Stack>
              </Box>


              {/* =====================================================
                WEEKDAY HEADER
            ===================================================== */}

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(7, 1fr)",

                  columnGap: "5px",

                  height: "30px",

                  mb: ".5rem",
                }}
              >
                {weekdays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "12px",
                          sm: ".7rem",
                        },

                        fontWeight: 600,

                        color: "#98A2B3",

                        lineHeight: 1,
                      }}
                    >
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>


              {/* =====================================================
                CALENDAR
            ===================================================== */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${year}-${month}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: "grid",

                      gridTemplateColumns:
                        "repeat(7, minmax(0, 1fr))",

                      columnGap: "5px",

                      rowGap: "10px",
                    }}
                  >
                    {days.map((item, index) => {
                      const status = item.currentMonth
                        ? attendanceDataCalender[item.day]
                        : null;

                      const statusStyle =
                        statusStyles1[status];

                      const isWeekend =
                        index % 7 === 5 ||
                        index % 7 === 6;

                      /*
                       * IMPORTANT:
                       * Normal dates have NO background.
                       * Only status dates get background.
                       *
                       * Weekend dates from screenshot get
                       * light gray background.
                       */

                      const showWeekendBackground =
                        !item.currentMonth &&
                        isWeekend;

                      return (
                        <Box
                          key={index}
                          sx={{
                            height: {
                              xs: "44px",
                              sm: "1.5rem",
                            },

                            borderRadius: "11px",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            backgroundColor:
                              statusStyle?.background ||
                              (showWeekendBackground
                                ? "#F6F7F9"
                                : "transparent"),

                            transition:
                              "background-color 0.15s ease",

                            cursor:
                              item.currentMonth
                                ? "pointer"
                                : "default",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: {
                                xs: "15px",
                                sm: ".7rem",
                              },

                              lineHeight: 1,

                              fontWeight:
                                status === "selected"
                                  ? 700
                                  : 400,

                              color:
                                statusStyle?.color ||
                                (item.currentMonth
                                  ? "#17202A"
                                  : "#A5ACB8"),
                            }}
                          >
                            {item.day}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </motion.div>
              </AnimatePresence>

              {/* =====================================================
                LEGEND
            ===================================================== */}

              <Box
                sx={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  alignItems: "center",
                  mt: "1.5rem",
                }}
              >
                <LegendItem
                  color="#CFF7E5"
                  label="Present"
                />

                {/* <LegendItem
                  color="#FFF1C7"
                  label="Late"
                /> */}

                <LegendItem
                  color="#F9DDDD"
                  label="Absent"
                />

                <LegendItem
                  color="#E9E3F8"
                  label="Leave"
                />
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: "590px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E6EAF0",
                borderRadius: "24px",
                boxShadow: "0px 2px 8px rgba(16, 24, 40, 0.04)",
                boxSizing: "border-box",

                mt: 1,

                px: {
                  xs: "20px",
                  sm: ".8rem",
                },

                pt: {
                  xs: "20px",
                  sm: ".8rem",
                },

                pb: {
                  xs: "12px",
                  sm: "0.5rem",
                },
              }}
            >
              {/* Title */}
              <Typography
                sx={{
                  fontSize: {
                    xs: "28px",
                    sm: "1rem",
                  },
                  fontWeight: 500,
                  color: "#111827",
                  lineHeight: 1.2,
                  mb: {
                    xs: "8px",
                    sm: "0.5rem",
                  },
                }}
              >
                Today's Summary
              </Typography>

              {/* Summary Rows */}
              <Stack>
                {summaryData.map((item, index) => (
                  <Box
                    key={item.label}
                    sx={{
                      height: {
                        xs: "58px",
                        sm: "1.5rem",
                      },

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        index !== summaryData.length - 1
                          ? "1px solid #EEF1F5"
                          : "none",
                    }}
                  >
                    {/* Label */}
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "18px",
                          sm: ".8rem",
                        },
                        fontWeight: 400,
                        color: "#536078",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </Typography>

                    {/* Value */}
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "18px",
                          sm: ".8rem",
                        },
                        fontWeight: 600,
                        color: item.color,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <RequestCorrection
        open={open}
        handleClose={handleClose}
        setSnackbar={setSnackbar}
        getAttendanceData={getAttendanceData}
        selectedAttendance={selectedAttendance}
      />
      <AttendanceDetailsDrawer
        open={openAttendanceDrawer}
        onClose={handleCloseAttendanceDrawer}
        employee={selectedAttendance}
      />

      <LocationTracking
        open={openTrackingDrawer}
        onClose={handleCloseTrackingDrawer}
        employee={selectedAttendance}
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
    </Box>
  )
}
const HeaderText = ({ children }) => (
  <Typography
    sx={{
      fontSize: ".7rem",
      fontWeight: 600,
      color: "#626A75",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </Typography>
);
export default AttendanceManagment