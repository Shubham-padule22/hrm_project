import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Breadcrumbs,
  // Link,
} from "@mui/material";
import { Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
// import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import PremiumSnackbar from "../common/PremiumSnackbar";
import { API_BASE_URL } from "../../Config/api";
import axiosInstance from "../../Config/axiosInstance";
import AddShift from "./AddShift";
import ViewRoster from "./ViewRoster";
import { hasPermission } from "../common/permissionUtils";
// const employees = [
//   {
//     id: 1,
//     name: "Marcus Johnson",
//     role: "EMP001 · Operations",
//     initials: "MJ",
//   },
//   {
//     id: 2,
//     name: "Priya Sharma",
//     role: "EMP002 · Human Resources",
//     initials: "PS",
//   },
//   {
//     id: 3,
//     name: "James Okafor",
//     role: "EMP003 · Dispatch",
//     initials: "JO",
//   },
//   {
//     id: 4,
//     name: "Elena Rodriguez",
//     role: "EMP004 · Clinical",
//     initials: "ER",
//   },
//   {
//     id: 5,
//     name: "Tyler Brooks",
//     role: "EMP005 · Fleet Management",
//     initials: "TB",
//   },
//   {
//     id: 6,
//     name: "Aisha Williams",
//     role: "EMP006 · Clinical",
//     initials: "AW",
//   },
//   {
//     id: 7,
//     name: "Kevin Nakamura",
//     role: "EMP007 · Information Technology",
//     initials: "KN",
//   },
//   {
//     id: 8,
//     name: "Diana Foster",
//     role: "EMP008 · Finance",
//     initials: "DF",
//   },
// ];

const days = [
  { day: "Mon", date: "20" },
  { day: "Tue", date: "21" },
  { day: "Wed", date: "22" },
  { day: "Thu", date: "23" },
  { day: "Fri", date: "24", today: true },
  { day: "Sat", date: "25" },
  { day: "Sun", date: "26" },
];

// const shiftData1 = {
//   1: {
//     0: "Morning",
//     1: "Morning",
//     2: "Morning",
//     3: "Morning",
//   },

//   2: {
//     1: "Night",
//     2: "Night",
//     3: "Night",
//     5: "Night",
//     6: "Night",
//   },

//   3: {
//     0: "Off",
//     1: "Off",
//     2: "Off",
//     4: "Off",
//   },

//   4: {
//     0: "Night",
//     2: "Night",
//     3: "Night",
//     5: "Night",
//     6: "Night",
//   },
// };

const shiftStyles = {
  Morning: {
    background: "#fff0dc",
    color: "#ff9800",
    icon: "☀",
  },

  Night: {
    background: "#eee8ff",
    color: "#7447f5",
    icon: "☾",
  },

  Off: {
    background: "#ffe4e4",
    color: "#f44336",
    icon: "♙",
  },
};

const ShiftCell = ({ shift, rosterItems = [], onEdit, onDelete, onAdd, employeeId, date }) => {
  // API mapping returns an array
  const shifts = Array.isArray(shift)
    ? shift
    : shift
      ? [shift]
      : [];

  if (!shifts.length) {
    return (
      <Box
        component="button"
        type="button"
        onClick={() => onAdd?.(employeeId, date)}
        sx={{
          height: "100%",
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d8dde5",
          fontSize: ".7rem",
          width: "100%",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          transition: "all 0.2s ease",
          borderRadius: "6px",
          "&:hover": {
            backgroundColor: "#f7fafb",
            color: "#e82d45",
          },
        }}
      >
        +
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0.3,
        overflow: "hidden",
      }}
    >
      {shifts.map((shiftName, index) => {
        const style = shiftStyles[shiftName];
        const rosterItem = rosterItems[index];

        // Safety check if API returns an unknown shift
        if (!style) {
          return (
            <Box
              key={`${shiftName}-${index}`}
              sx={{
                color: "#555",
                fontSize: ".6rem",
                fontWeight: 500,
              }}
            >
              {shiftName}
            </Box>
          );
        }

        return (
          <Box
            key={`${shiftName}-${index}`}
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: style.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.4,
              color: style.color,
              fontSize: ".6rem",
              fontWeight: 500,
              borderRadius: "3px",
              "&:hover .shift-actions, &:focus-within .shift-actions": {
                opacity: 1,
              },
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: ".6rem",
                lineHeight: 1,
              }}
            >
              {style.icon}
            </Box>

            {shiftName}
            {rosterItem && (
              <Box
                className="shift-actions"
                sx={{
                  display: "flex",
                  ml: "auto",
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                <IconButton
                  size="small"
                  title="Update shift"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(rosterItem);
                  }}
                  sx={{ p: 0.1, color: "#49635e" }}
                >
                  <EditIcon sx={{ fontSize: 12 }} />
                </IconButton>
                <IconButton
                  size="small"
                  title="Delete shift"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(rosterItem);
                  }}
                  sx={{ p: 0.1, color: "#c62828" }}
                >
                  <DeleteIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default function ShiftManagement() {

  const canAddShift = hasPermission(
    "Attendance",
    "Shift-Management",
    "Add-Shift"
  );

  const canViewRoster = hasPermission(
    "Attendance",
    "Shift-Management",
    "View-Roster"
  );

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('');
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([])
  const [view, setView] = useState("week");
  const [clg_id, setclg_id] = useState(null);
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase())
  );
  const getEmployees = async () => {
    try {
      const response = await axiosInstance.get(
        "/hrm_web/employees/"
      );
      setclg_id(response.data.data)
      if (response.data?.status) {
        const mappedEmployees = (response.data.data || []).map(
          (employee) => ({
            id: employee.clg_id,
            name: employee.employee_name || "",
            role: `${employee.clg_code || ""} · ${employee.department_name ||
              employee.group_name ||
              "N/A"
              }`,
            initials: getInitials(employee.employee_name),
            clg_id: employee.clg_id,
            clg_code: employee.clg_code,
            department_name: employee.department_name,
            group_name: employee.group_name,
            gcode: employee.gcode,
          })
        );
        setSelectedEmployee(mappedEmployees[0].id || 0)
        setEmployees(mappedEmployees);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };
  const getInitials = (name = "") => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);

    return d;
  };
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [monthStart, setMonthStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
    });
  };

  const formatApiDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getWeekDays = (weekStart) => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);

      date.setDate(weekStart.getDate() + index);

      return {
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        date: formatShortDate(date),
        fullDate: date,
        today: date.toDateString() === new Date().toDateString(),
      };
    });
  };
  const days = getWeekDays(weekStart);

  const getMonthDays = (monthStart) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDayOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(year, month, index + 1);

        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          date: formatShortDate(date),
          fullDate: date,
          today: date.toDateString() === new Date().toDateString(),
        };
      }),
    ];
  };
  const monthDays = getMonthDays(monthStart);

  const handlePreviousWeek = () => {
    setWeekStart((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 7);
      return date;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 7);
      return date;
    });
  };

  const handleCurrentWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  const handlePreviousMonth = () => {
    setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    setMonthStart(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  //add shift logic 
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [open, setOpen] = useState(false);
  const [editingRoster, setEditingRoster] = useState(null);
  const handleClose = () => {
    setOpen(false);
    setEditingRoster(null);
  };
  const handleOpenAdd = (employeeId = null, date = null) => {
    setEditingRoster(null);
    setOpen(true);

    if (employeeId && date) {
      console.log("Opening add shift modal for employee:", employeeId, "on date:", date);
    }
  };
  const handleOpenEdit = (rosterItem) => {
    setEditingRoster(rosterItem);
    setOpen(true);
  };

  const handleDelete = async (rosterItem) => {
    if (!rosterItem?.roster_id) return;

    const confirmResult = await Swal.fire({
      title: "Delete shift assignment?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axiosInstance.delete(`/hrm_web/shift-roster/${rosterItem.roster_id}/`);
      setSnackbar({
        open: true,
        type: "success",
        title: "Deleted",
        message: "Shift assignment deleted successfully.",
      });
      refreshCalendar();
    } catch (error) {
      setSnackbar({
        open: true,
        type: "error",
        title: "Delete failed",
        message: error.response?.data?.message || "Unable to delete shift assignment.",
      });
    }
  };

  const [shiftRoster, setShiftRoster] = useState([]);
  const [shiftData, setShiftData] = useState({});
  const getShiftName = (rosterItem) => {
    if (rosterItem.shift_name) {
      return rosterItem.shift_name.replace(/\s+shift$/i, "");
    }

    return rosterItem.is_weekoff ? "Off" : null;
  };

  const getShiftRoster = async (startDate, endDate, empId) => {
    if (!startDate || !endDate || !empId) {
      setShiftRoster([]);
      return;
    }

    try {
      const response = await axiosInstance.get(
        "/hrm_web/shift-roster/",
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            emp_id: empId,
          },
        }
      );
      const rosterData = response.data.data || [];

      // const mappedShiftData = {};

      // rosterData.forEach((item) => {
      //   if (!mappedShiftData[item.employee]) {
      //     mappedShiftData[item.employee] = {};
      //   }

      //   mappedShiftData[item.employee][item.roster_date] = getShiftName(item);
      // });

      const mappedShiftData = {};

      rosterData.forEach((item) => {
        if (!mappedShiftData[item.employee]) {
          mappedShiftData[item.employee] = {};
        }

        if (!mappedShiftData[item.employee][item.roster_date]) {
          mappedShiftData[item.employee][item.roster_date] = [];
        }

        const shiftName = getShiftName(item);

        if (shiftName) {
          mappedShiftData[item.employee][item.roster_date].push(shiftName);
        }
      });

      setShiftRoster(rosterData);
      setShiftData(mappedShiftData);
    } catch (error) {
      console.error("Error fetching shift roster:", error);
      setShiftRoster([]);
      setShiftData({});
    }
  };

  useEffect(() => {
    const startDate = view === "month" ? monthStart : weekStart;
    const endDate = view === "month"
      ? new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      : new Date(weekStart);

    if (view === "week") {
      endDate.setDate(endDate.getDate() + 6);
    }

    getShiftRoster(
      formatApiDate(startDate),
      formatApiDate(endDate),
      selectedEmployee
    );
  }, [selectedEmployee, weekStart, monthStart, view]);

  const refreshCalendar = () => {
    const startDate = view === "month" ? monthStart : weekStart;
    const endDate = view === "month"
      ? new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      : new Date(weekStart);

    if (view === "week") {
      endDate.setDate(endDate.getDate() + 6);
    }

    getShiftRoster(
      formatApiDate(startDate),
      formatApiDate(endDate),
      selectedEmployee
    );
  };

  const rosterEmployeeIds = [
    ...new Set(shiftRoster.map((rosterItem) => rosterItem.employee)),
  ];
  const getRosterItems = (employeeId, date) =>
    shiftRoster.filter(
      (item) =>
        Number(item.employee) === Number(employeeId) &&
        item.roster_date === formatApiDate(date)
    );
  const monthWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (viewMode) {
    return <ViewRoster onBack={() => setViewMode(false)} />;
  }
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        p: 1.5,
        boxSizing: "border-box",
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
          <Link
            // component={RouterLink}
            to={'/Attendance-management'}
            style={{
              fontSize: "0.875rem",
              textDecoration: "none",
              color: "#626A75",
            }}
          >
            <Link
              // component={RouterLink}
              to={'/Shift-Management'}
              style={{
                fontSize: "0.875rem",
                textDecoration: "none",
                color: "#626A75",
              }}
            >
              Shift Management
            </Link>
          </Link>
        </Breadcrumbs>
      </motion.div>
      {/* ================= TOP HEADER ================= */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.2,
          gap: 1,
        }}
      >
        {/* Title + Add Shift */}
        <Stack
          sx={{
            width: "25%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontSize: "1rem",
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#20252b",
              width: 52,
            }}
          >
            Shift
            <br />
            Management
          </Typography>

          {(canAddShift && <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
            onClick={handleOpenAdd}
            sx={{
              height: 25,
              minWidth: 75,
              borderRadius: "14px",
              textTransform: "none",
              fontSize: ".7rem",
              fontWeight: 600,
              backgroundColor: "#e82d45",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#d7253b",
                boxShadow: "none",
              },
            }}
          >
            Assign shift
          </Button>)}
        </Stack>

        {/* Search */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "75%",
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "6px 10px",
            gap: 1,
            ml: 2,
            py: 1
          }}
        >
          {/* Search */}
          <Box
            sx={{
              position: "relative",
              width: {
                xs: 150,
                sm: 200,
                md: 300,
              },
              ml: 2,
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
                width: 23,
              }}
            />

            <TextField
              size="small"
              placeholder="Search Employee..."
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

          {/* Push controls to right */}
          <Box sx={{ flex: 1 }} />

          {/* Week / Month */}
          <ToggleButtonGroup
            exclusive
            value={view}
            onChange={(e, value) => value && setView(value)}
            sx={{
              height: 25,

              "& .MuiToggleButton-root": {
                border: "none",
                textTransform: "none",
                fontSize: ".7rem",
                px: 1.2,
                color: "#777",
                backgroundColor: "#fff",
                minWidth: 32,
              },

              "& .Mui-selected": {
                backgroundColor: "#103d35 !important",
                color: "#fff !important",
                borderRadius: "10px !important",
              },
            }}
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Monthly</ToggleButton>
          </ToggleButtonGroup>

          {/* View Roster */}
          {(canViewRoster &&<Button
            variant="contained"
            onClick={() => setViewMode("roster")}
            startIcon={
              <CalendarMonthIcon
                sx={{ fontSize: ".7rem !important" }}
              />
            }
            sx={{
              height: 25,
              minWidth: 70,
              borderRadius: "14px",
              textTransform: "none",
              fontSize: ".7rem",
              backgroundColor: "#ed3147",
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#d9273c",
                boxShadow: "none",
              },
            }}
          >
            View Roster
          </Button>)}
        </Box>
      </Box>

      {/* ================= MAIN CONTENT ================= */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "25% minmax(0, 1fr)",
          gap: 1.5,
          height: "auto",
          minHeight: 270,
        }}
      >
        {/* ================= EMPLOYEE SIDEBAR ================= */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.7,
            // overflow: "hidden",
            mb: 2,
            overflowY: 'scroll',
            height: '65vh',
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredEmployees.map((employee) => {
              const selected = selectedEmployee === employee.id;

              return (
                <Paper
                  key={employee.id}
                  elevation={0}
                  onClick={() => setSelectedEmployee(employee.id)}
                  sx={{
                    position: "relative",
                    height: 45,
                    flexShrink: 0,
                    borderRadius: "5px",
                    border: selected
                      ? "1px solid #9bb8b2"
                      : "1px solid #e5e9ed",
                    backgroundColor: selected ? "#f7fbfa" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    px: 0.8,
                    py: 1,
                    overflow: "hidden",

                    "&::before": selected
                      ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        // width: 3,
                        backgroundColor: "#103d35",
                        borderRadius: "5px 0 0 5px",
                      }
                      : {},
                  }}
                >
                  <Avatar
                    sx={{
                      width: 25,
                      height: 25,
                      fontSize: '.6rem',
                      fontWeight: 700,
                      backgroundColor: "#13302C",
                      color: "#ffffff",
                      mr: 0.8,
                    }}
                  >
                    {employee.initials}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: ".7rem",
                        fontWeight: 700,
                        color: "#293139",
                        lineHeight: 1.1,
                      }}
                    >
                      {employee.name}
                    </Typography>

                    <Typography
                      noWrap
                      sx={{
                        fontSize: ".6rem",
                        color: "#89919b",
                        mt: 0.2,
                      }}
                    >
                      {employee.role}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </AnimatePresence>
        </Box>

        {/* ================= PLANNER ================= */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e6ea",
            borderRadius: "8px",
            backgroundColor: "#fff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            mb: 2
          }}
        >
          {/* Planner Header */}
          <Box
            sx={{
              height: 39,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #e9ecef",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: ".7rem",
                fontWeight: 800,
                color: "#252b31",
              }}
            >
              {view === "month" ? "Monthly Shift Planner — " : "Weekly Shift Planner — "}
              {view === "month"
                ? monthStart.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
                : `${formatDate(weekStart)} - ${formatDate(
                  new Date(
                    weekStart.getFullYear(),
                    weekStart.getMonth(),
                    weekStart.getDate() + 6
                  )
                )}`}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <IconButton
                onClick={view === "month" ? handlePreviousMonth : handlePreviousWeek}
                size="small"
                sx={{
                  width: 30,
                  height: 30,
                  border: "1px solid #e2e5e8",
                  borderRadius: "50%",
                  color: "#000",
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>

              <Button
                onClick={view === "month" ? handleCurrentMonth : handleCurrentWeek}
                size="small"
                sx={{
                  textTransform: "none",
                  fontSize: ".6rem",
                  minWidth: 150,
                  height: 30,
                  color: "#000",
                  border: "1px solid #e2e5e8",
                  borderRadius: "20px",
                  backgroundColor: "#fff",
                }}
              >
                {view === "month"
                  ? monthStart.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                  : `${formatDate(weekStart)} - ${formatDate(
                    new Date(
                      weekStart.getFullYear(),
                      weekStart.getMonth(),
                      weekStart.getDate() + 6
                    )
                  )}`}
              </Button>

              <IconButton
                onClick={view === "month" ? handleNextMonth : handleNextWeek}
                size="small"
                sx={{
                  width: 30,
                  height: 30,
                  border: "1px solid #e2e5e8",
                  borderRadius: "50%",
                  color: "#000",
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Calendar Grid */}
          {/* ================= CALENDAR GRID ================= */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              p: view === "month" ? 0.7 : 0,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {view === "month" ? (
              <>
                {/* Month Weekday Header */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: 0.7,
                    mb: 0.7,
                  }}
                >
                  {monthWeekdays.map((day) => (
                    <Box
                      key={day}
                      sx={{
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "#68717b",
                          fontWeight: 700,
                        }}
                      >
                        {day}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Month Days */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gridAutoRows: "minmax(72px, 1fr)",
                    gap: 0.7,
                    height: "calc(100% - 35px)",
                  }}
                >
                  {monthDays.map((day, index) => {
                    const shifts = day
                      ? shiftData[selectedEmployee]?.[
                      formatApiDate(day.fullDate)
                      ] || []
                      : [];
                    const rosterItems = day
                      ? getRosterItems(selectedEmployee, day.fullDate)
                      : [];

                    return day ? (
                      <MonthShiftCell
                        key={formatApiDate(day.fullDate)}
                        date={day}
                        shifts={shifts}
                        rosterItems={rosterItems}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <Box
                        key={`empty-${index}`}
                        sx={{
                          minHeight: 72,
                        }}
                      />
                    );
                  })}
                </Box>
              </>
            ) : (
              /* ================= WEEK VIEW ================= */
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gridTemplateRows: "42px repeat(8, minmax(0, 1fr))",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                {/* Week Day Headers */}
                {days.map((day, index) => (
                  <Box
                    key={`${day.date}-${index}`}
                    sx={{
                      borderRight: "1px solid #e7eaee",
                      borderBottom: "1px solid #e7eaee",
                      backgroundColor: day.today ? "#edf0f2" : "#f8f9fa",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: ".7rem",
                        color: "#67717b",
                        fontWeight: 600,
                      }}
                    >
                      {day.day}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: ".7rem",
                        color: "#30363c",
                        fontWeight: 800,
                        mt: 0.3,
                      }}
                    >
                      {day.date}
                    </Typography>
                  </Box>
                ))}

                {/* Week Employee Rows */}
                {rosterEmployeeIds.map((employeeId) =>
                  days.map((day) => (
                    <Box
                      key={`${employeeId}-${day.date}`}
                      sx={{
                        borderRight: "1px solid #e7eaee",
                        borderBottom: "1px solid #e7eaee",
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      <ShiftCell
                        shift={
                          shiftData[employeeId]?.[
                          formatApiDate(day.fullDate)
                          ]
                        }
                        rosterItems={getRosterItems(employeeId, day.fullDate)}
                        employeeId={employeeId}
                        date={day.fullDate}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onAdd={handleOpenAdd}
                      />
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              height: 28,
              display: "flex",
              alignItems: "center",
              px: 1.5,
              gap: 1.2,
              borderTop: "1px solid #edf0f2",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: ".7rem",
                color: "#4f5963",
                fontWeight: 600,
              }}
            >
              Shifts:
            </Typography>

            <Stack direction="row" spacing={1.2}>
              <Stack direction="row" spacing={0.4} alignItems="center">
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#ff9800",
                  }}
                />
                <Typography sx={{ fontSize: ".7rem", color: "#ff9800" }}>
                  Morning
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.4} alignItems="center">
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#7447f5",
                  }}
                />
                <Typography sx={{ fontSize: ".7rem", color: "#7447f5" }}>
                  Night
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.4} alignItems="center">
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#f44336",
                  }}
                />
                <Typography sx={{ fontSize: ".7rem", color: "#f44336" }}>
                  Off
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
      <AddShift
        open={open}
        handleClose={handleClose}
        setSnackbar={setSnackbar}
        getShiftRoster={refreshCalendar}
        editRoster={editingRoster}
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
  );
}

const MonthShiftCell = ({ date, shifts = [], rosterItems = [], onEdit, onDelete }) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        minHeight: 72,
        border: date?.today
          ? "1px solid #6f8f88"
          : "1px solid #e4e8ec",
        borderRadius: "14px",
        backgroundColor: date?.today ? "#f8fbfa" : "#fff",
        p: 0.7,
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "#9bb8b2",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        },
      }}
    >
      {/* Date */}
      {date && (
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#5f6872",
            lineHeight: 1,
            mb: 0.7,
          }}
        >
          {Number(date.date)}
        </Typography>
      )}

      {/* Shifts */}
      <Stack
        spacing={0.35}
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        {shifts.map((shift, index) => {
          const style = shiftStyles[shift];
          const rosterItem = rosterItems[index];

          return (
            <Box
              key={`${shift}-${index}`}
              sx={{
                width: "100%",
                height: 15,
                minHeight: 25,
                display: "flex",
                alignItems: "center",
                gap: 0.35,
                px: 0.55,
                borderRadius: "3px",
                backgroundColor: style?.background || "#f1f3f5",
                color: style?.color || "#555",
                boxSizing: "border-box",
                overflow: "hidden",
                "&:hover .shift-actions, &:focus-within .shift-actions": {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: "0.65rem",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {style?.icon}
              </Box>

              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {shift}
              </Typography>
              {rosterItem && (
                <Box
                  className="shift-actions"
                  sx={{
                    display: "flex",
                    ml: "auto",
                    opacity: 0,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <IconButton
                    size="small"
                    title="Update shift"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(rosterItem);
                    }}
                    sx={{ p: 0.15, color: "#49635e" }}
                  >
                    <EditIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Delete shift"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(rosterItem);
                    }}
                    sx={{ p: 0.15, color: "#c62828" }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};