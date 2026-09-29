import { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  InputBase,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { motion, AnimatePresence, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// =========================================================
// REACT JOYRIDE IMPORT FIX FOR VITE
// =========================================================
import * as JoyrideModule from "react-joyride";
const Joyride = JoyrideModule.default || JoyrideModule.Joyride || JoyrideModule;
const { STATUS } = JoyrideModule;

import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import axiosInstance from "../../Config/axiosInstance";
import CustomPagination from "../common/Custompagination";
import PremiumSnackbar from "../common/PremiumSnackbar";
import { hasPermission } from "../common/permissionUtils";

/* =========================================================
  FILTERS & MAPPINGS
========================================================= */

const statusFilters = ["All", "Active", "On Leave", "Suspended"];

const getStatusId = (statusStr) => {
  switch (statusStr) {
    case "Active":
      return 1;
    case "On Leave":
      return 2;
    case "Suspended":
      return 3;
    default:
      return 0; // "All"
  }
};

const topActionBtnStyle = {
  textTransform: "none",
  color: "#6B7280",
  fontWeight: 600,
  fontSize: "13px",
  px: 1.5,
  "&:hover": {
    backgroundColor: "#F3F4F6",
    color: "#111827",
  },
};

/* =========================================================
  AVATAR COLORS
========================================================= */

const avatarColors = [
  "#0B6658",
  "#4169E1",
  "#7545D9",
  "#D62839",
  "#18A66D",
  "#F29F05",
  "#1687A7",
  "#7947D8",
];

/* =========================================================
  ANIMATION VARIANTS
========================================================= */

const leftSidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const leftCardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 250, damping: 20 },
  },
};

const rightContentVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 22, delay: 0.15 },
  },
};

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: "easeOut" },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* =========================================================
  COMPONENTS
========================================================= */

const StatCard = ({ icon, value, label, valueColor, background }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const targetValue = parseInt(value, 10) || 0;
    const controls = animate(0, targetValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (val) => {
        setDisplayValue(Math.round(val));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <Box
      component={motion.div}
      variants={leftCardVariants}
      whileHover={{ scale: 1.03 }}
      sx={{
        height: 72,
        borderRadius: "9px",
        background,
        px: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        mb: 1,
        border: "1px solid rgba(0,0,0,0.03)",
        cursor: "default",
      }}
    >
      <Box
        sx={{
          width: 29,
          height: 29,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: valueColor,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: "1.5rem",
            lineHeight: 1,
            fontWeight: 700,
            color: valueColor,
          }}
        >
          {displayValue}
        </Typography>

        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: "500",
            color: "#374151",
            mt: 0.4,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const StatusChip = ({ status }) => {
  const styles = {
    Active: { background: "#E4F8F1", color: "#15956E" },
    "On Leave": { background: "#FFF3D8", color: "#E99A00" },
    Suspended: { background: "#FFE5E7", color: "#E64A55" },
  };
  const style = styles[status] || styles.Active;

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        height: 19,
        borderRadius: "5px",
        fontSize: 8.5,
        fontWeight: 600,
        backgroundColor: style.background,
        color: style.color,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
};

const TypeChip = ({ type }) => {
  const isPartTime = type === "Part-Time";
  return (
    <Chip
      label={type}
      size="small"
      sx={{
        height: 19,
        borderRadius: "5px",
        fontSize: 8.5,
        fontWeight: 600,
        backgroundColor: isPartTime ? "#F2E9FF" : "#E5EEFF",
        color: isPartTime ? "#7B35D8" : "#2868D8",
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
};

/* =========================================================
  MAIN DIRECTORY COMPONENT
========================================================= */

export default function EmployeeDirectory() {
  const canRegisterEmployee = hasPermission(
    "Employees",
    "Employee-Directory",
    "Register"
  );

  const canEditEmployee = hasPermission(
    "Employees",
    "Employee-Directory",
    "Edit"
  );

  const canViewEmployee = hasPermission(
    "Employees",
    "Employee-Directory",
    "View"
  );

  const canImportEmployee = hasPermission(
    "Employees",
    "Employee-Directory",
    "Import"
  );

  const canExportTemplate = hasPermission(
    "Employees",
    "Employee-Directory",
    "Export-Template"
  );

  const canShowEmployeeActions = true;

  const employeeGridColumns = canShowEmployeeActions
    ? "1.55fr 0.72fr 1.30fr 1.20fr 1.28fr 1.08fr 0.82fr 0.82fr 0.88fr 110px"
    : "1.55fr 0.72fr 1.30fr 1.20fr 1.28fr 1.08fr 0.82fr 0.82fr 0.88fr";
    
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState("All");
  const [activeDeptId, setActiveDeptId] = useState(0);

  const [refresh, setRefresh] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([{ id: 0, name: "All" }]);
  const [counts, setCounts] = useState({
    Total: 0,
    active: 0,
    On_Leave: 0,
    Suspended: 0,
  });
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [importResult, setImportResult] = useState({
    open: false,
    data: null,
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  /* =======================================================
    REACT JOYRIDE STATE & HANDLERS
  ======================================================= */
  const [{ runTour, tourSteps }, setTourState] = useState({
    runTour: false, 
    tourSteps: [
      {
        target: ".tour-stat-cards",
        content: "Here you can see the overall count of your employees based on their current status.",
        disableBeacon: true,
      },
      {
        target: ".tour-register-btn",
        content: "Click here to manually register a new employee into the system.",
      },
      {
        target: ".tour-search-bar",
        content: "Use this search bar to quickly find an employee by their name, email, or ID.",
      },
      {
        target: ".tour-dept-filter",
        content: "Filter the directory by specific departments using this dropdown.",
      },
      {
        target: ".tour-import-export",
        content: "Use these options to bulk import employees via Excel/CSV or download the blank template.",
      },
      {
        target: ".tour-status-filter",
        content: "Click on these chips to quickly filter the list to show Active, On Leave, or Suspended employees.",
      },
      {
        target: ".tour-employee-table",
        content: "This is your employee directory table. You can View, Edit, or Delete records using the action buttons on the right.",
      },
    ],
  });

  // =======================================================
  // AUTO-START TOUR ON PAGE LOAD (COMMENTED OUT FOR NOW)
  // =======================================================
  /*
  useEffect(() => {
    const tourTimer = setTimeout(() => {
      setTourState((prev) => ({ ...prev, runTour: true })); 
    }, 500);

    return () => clearTimeout(tourTimer);
  }, []); 
  */

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setTourState((prev) => ({ ...prev, runTour: false }));
    }
  };

  /* =======================================================
    API INTEGRATION (AXIOS)
  ======================================================= */

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axiosInstance.get("hrm_web/EmployeeDirectoryCount/");
        if (res.data) setCounts(res.data);
      } catch (error) {
        console.error("Failed to fetch counts", error);
      }
    };
    fetchCounts();
  }, [refresh]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosInstance.get("hrm_web/FetchDepartment/");
        const data = res.data;
        if (Array.isArray(data)) {
          let deptOptions = data.map((d) => ({
            id: d.pk_id,
            name: d.department_name,
          }));
          deptOptions.sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : 0));
          setDepartments(deptOptions);
        }
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const statusId = getStatusId(status);
        const res = await axiosInstance.get(
          `hrm_web/employee_details/?dept=${activeDeptId}&status=${statusId}`,
        );
        const data = res.data;

        if (data && data.response) {
          const mappedEmployees = data.response.map((emp) => {
            const fullName =
              `${emp.clg_first_name || ""} ${emp.clg_mid_name || ""} ${emp.clg_last_name || ""}`
                .replace(/\s+/g, " ")
                .trim();
            return {
              id: String(emp.clg_id),
              username: emp.clg_ref_id || "N/A",
              name: fullName || "N/A",
              email: emp.clg_email || "N/A",
              department: emp.Department_name || "N/A",
              role: emp.role || "N/A",
              branch: emp.branch ? `Branch ${emp.branch}` : "N/A",
              type: "Full-Time",
              status: emp.status || "Active",
              joined: emp.clg_joining_date || emp.clg_active_date || "N/A",
              avatar: fullName ? fullName[0].toUpperCase() : "U",
            };
          });
          setEmployees(mappedEmployees);
          setPage(1);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Failed to fetch employees", error);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, [activeDeptId, status, refresh]);

  /* =======================================================
    DELETE HANDLER (SWEETALERT + API)
  ======================================================= */

  const handleDeleteEmployee = (employeeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post("hrm_web/soft_delete_user/", {
            clg_id: parseInt(employeeId),
          });
          
          Swal.fire({
            title: "Deleted!",
            text: "Employee has been successfully deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          
          setSearch("");
          setPage(1);
          setEmployees((prevEmployees) => 
            prevEmployees.filter((emp) => emp.id !== String(employeeId))
          );
          setRefresh((prev) => prev + 1);

        } catch (error) {
          console.error("Delete failed", error);
          Swal.fire("Error!", "Failed to delete employee. Please try again.", "error");
        }
      }
    });
  };

  /* =======================================================
    EXPORT / IMPORT HANDLERS
  ======================================================= */

  const handleExportTemplate = async () => {
    try {
      setSnackbar({
        open: true,
        message: "Downloading template...",
        severity: "info",
      });

      const response = await axiosInstance.get(
        "hrm_web/employee_import_template/",
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Employee_Import_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({
        open: true,
        message: "Template Exported Successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Template export failed", error);
      setSnackbar({
        open: true,
        message: "Failed to export the template.",
        severity: "error",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValidFile =
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");

    if (!isValidFile) {
      setSnackbar({
        open: true,
        message: "Please upload a valid CSV or Excel file.",
        severity: "error",
      });
      event.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSnackbar({
        open: true,
        message: "Uploading file...",
        severity: "info",
      });

      const response = await axiosInstance.post(
        "hrm_web/employee_registretion/import/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setImportResult({ open: true, data: response.data });
      setRefresh((prev) => prev + 1);
      setSnackbar((prev) => ({ ...prev, open: false }));
    } catch (error) {
      console.error("Import failed", error);
      setSnackbar((prev) => ({ ...prev, open: false }));

      if (error.response && error.response.data && error.response.data.errors) {
        setImportResult({ open: true, data: error.response.data });
        setRefresh((prev) => prev + 1);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to import the file. Server Error.",
          severity: "error",
        });
      }
    } finally {
      event.target.value = null;
    }
  };

  const handleDownloadErrorReport = () => {
    if (
      !importResult.data ||
      !importResult.data.errors ||
      importResult.data.errors.length === 0
    ) {
      return;
    }

    const errorsArray = importResult.data.errors;
    const firstRowData = errorsArray[0].data || {};
    const headers = [...Object.keys(firstRowData), "Error_Reason"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    errorsArray.forEach((err) => {
      const rowData = err.data || {};
      const errorReasons = Object.entries(err.errors || {})
        .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
        .join(" | ");

      const values = headers.map((header) => {
        let val = header === "Error_Reason" ? errorReasons : rowData[header];
        if (val === null || val === undefined) val = "";
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "Import_Failed_Records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* =======================================================
    FILTER & PAGINATE EMPLOYEES
  ======================================================= */

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase();
      return (
        employee.name.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue) ||
        employee.id.toLowerCase().includes(searchValue) ||
        employee.username.toLowerCase().includes(searchValue) ||
        employee.department.toLowerCase().includes(searchValue) ||
        employee.role.toLowerCase().includes(searchValue)
      );
    });
  }, [employees, search]);

  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleEmployeeClick = (employee) => {
    navigate(`/employee-directory/${employee.id}`, { state: { employee } });
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        minHeight: "100vh",
        background: "#F5F7FA",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#1F2937",
        overflowX: "hidden",
      }}
    >
      {/* JOYRIDE COMPONENT */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#073F35',
            zIndex: 10000,
          },
        }}
      />

      <Box sx={{ display: "flex", minHeight: "calc(100vh - 48px)" }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 1.5, sm: 2, md: 2 },
            py: 1.2,
          }}
        >
          <CustomBreadcrumbs />

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "stretch" }}>
            <Box
              sx={{ width: { xs: "100%", sm: 200, md: 220 }, flexShrink: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E9ED",
                  borderRadius: "9px",
                  p: 1,
                }}
              >
                {/* TOUR TARGET: tour-register-btn */}
                <Box
                  className="tour-register-btn"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1vw",
                      fontWeight: 800,
                      lineHeight: 1.05,
                      color: "#18202A",
                    }}
                  >
                    Employee
                    <br />
                    Directory
                  </Typography>

                  {canRegisterEmployee && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate("/Employee-Registration")}
                      sx={{
                        borderRadius: "12px",
                        background:
                          "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
                        boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        px: 2.5,
                        py: 0.5,
                        "&:hover": {
                          background:
                            "linear-gradient(225deg, #C81A2B 14.64%, #E53945 85.36%)",
                          boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                        },
                      }}
                    >
                      Register
                    </Button>
                  )}
                </Box>

                {/* TOUR TARGET: tour-stat-cards */}
                <Box
                  className="tour-stat-cards"
                  component={motion.div}
                  variants={leftSidebarVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <StatCard
                    value={counts.Total || 0}
                    label="Total"
                    valueColor="#00986F"
                    background="#F0FDFA"
                    icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
                  />
                  <StatCard
                    value={counts.active || 0}
                    label="Active"
                    valueColor="#0867E8"
                    background="#EFF6FF"
                    icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
                  />
                  <StatCard
                    value={counts.On_Leave || 0}
                    label="On leave"
                    valueColor="#F28A00"
                    background="#FFF7ED"
                    icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
                  />
                  <StatCard
                    value={counts.Suspended || 0}
                    label="Suspended"
                    valueColor="#7435D5"
                    background="#F5F3FF"
                    icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
                  />
                </Box>
              </Paper>
            </Box>

            <Box
              component={motion.div}
              variants={rightContentVariants}
              initial="hidden"
              animate="visible"
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E9ED",
                  borderRadius: "9px",
                  p: 1.1,
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", flex: 1, gap: 1.5 }}>
                    
                    {/* TOUR TARGET: tour-search-bar */}
                    <Box
                      className="tour-search-bar"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        height: 42,
                        borderRadius: "24px",
                        background: isFocused ? "#FFFFFF" : "#F9FAFB",
                        border: isFocused ? "1px solid #00BC7D" : "1px solid transparent",
                        boxShadow: isFocused ? "0px 4px 12px rgba(0, 0, 0, 0.08)" : "none",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "#113229",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 22px",
                          borderRadius: "24px",
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
                      </Box>
                      <InputBase
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Name"
                        sx={{
                          flex: 1,
                          height: "100%",
                          padding: "0 16px",
                          fontSize: 14,
                          color: "#1F2937",
                          "& input::placeholder": {
                            color: "#9CA3AF",
                            opacity: 1,
                          },
                        }}
                      />
                    </Box>

                    {/* TOUR TARGET: tour-dept-filter */}
                    <TextField
                      className="tour-dept-filter"
                      select
                      value={activeDeptId}
                      onChange={(e) => {
                        setActiveDeptId(e.target.value);
                        setPage(1);
                      }}
                      sx={{
                        width: 100,
                        "& .MuiOutlinedInput-root": {
                          height: 42,
                          borderRadius: "10px",
                          fontSize: 13,
                          background: "#F8FAFC",
                          "& fieldset": { borderColor: "#E5E7EB" },
                          "&:hover fieldset": { borderColor: "#D1D5DB" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#D1D5DB",
                            borderWidth: "1px",
                          },
                        },
                      }}
                    >
                      {departments.map((dept) => (
                        <MenuItem
                          key={dept.id}
                          value={dept.id}
                          sx={{ fontSize: 13 }}
                        >
                          {dept.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {/* TOUR TARGET: tour-import-export */}
                  <Box className="tour-import-export" sx={{ display: "flex", gap: 0.5 }}>
                    
                    {canImportEmployee && (
                      <Button
                        variant="text"
                        startIcon={
                          <FileUploadOutlinedIcon sx={{ fontSize: 14 }} />
                        }
                        sx={{
                          ...topActionBtnStyle,
                          fontSize: "11px",
                          minWidth: "auto",
                          px: 0.8,
                          py: 0.3,
                          gap: 0.3,
                          "& .MuiButton-startIcon": {
                            marginRight: 0.3,
                            marginLeft: 0,
                          },
                        }}
                        onClick={handleImportClick}
                      >
                        Import
                      </Button>
                    )}
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />

                    {canExportTemplate && (
                      <Button
                        variant="text"
                        startIcon={
                          <FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />
                        }
                        sx={{
                          ...topActionBtnStyle,
                          fontSize: "11px",
                          minWidth: "auto",
                          px: 0.8,
                          py: 0.3,
                          gap: 0.3,
                          "& .MuiButton-startIcon": {
                            marginRight: 0.3,
                            marginLeft: 0,
                          },
                        }}
                        onClick={handleExportTemplate}
                      >
                        Export Template
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* TOUR TARGET: tour-status-filter */}
                <Box
                  className="tour-status-filter"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: 0.6,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#9AA1A9",
                        mr: 0.5,
                      }}
                    >
                      Status:
                    </Typography>

                    {statusFilters.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        onClick={() => setStatus(item)}
                        sx={{
                          height: 20,
                          borderRadius: "5px",
                          fontSize: 11,
                          fontWeight: status === item ? 700 : 500,
                          background: status === item ? "#073F35" : "#F8FAFC",
                          color: status === item ? "#fff" : "#4B5563",
                          border:
                            status === item ? "none" : "1px solid #E6E9ED",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>

              {/* TOUR TARGET: tour-employee-table */}
              <Paper
                className="tour-employee-table"
                elevation={0}
                sx={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E9ED",
                  borderRadius: "9px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 230px)",
                  }}
                >
                  <Box sx={{ minWidth: 800 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: employeeGridColumns,
                        alignItems: "center",
                        minHeight: 38,
                        px: 1.5,
                        borderBottom: "1px solid #E8EBEF",
                        background: "#FCFDFE",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                      }}
                    >
                      {[
                        "EMPLOYEE",
                        "ID",
                        "USERNAME",
                        "DEPARTMENT",
                        "ROLE",
                        "BRANCH",
                        "TYPE",
                        "STATUS",
                        "JOINED",
                        ...(canShowEmployeeActions ? ["ACTIONS"] : []),
                      ].map((heading) => (
                        <Typography
                          key={heading}
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#66717D",
                            letterSpacing: ".2px",
                          }}
                        >
                          {heading}
                        </Typography>
                      ))}
                    </Box>

                    <Box sx={{ position: "relative", minHeight: 200 }}>
                      {loading ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 200,
                          }}
                        >
                          <CircularProgress
                            size={24}
                            sx={{ color: "#073F35" }}
                          />
                        </Box>
                      ) : (
                        <AnimatePresence>
                          {paginatedEmployees.map((employee, index) => (
                            <Box
                              component={motion.div}
                              layout
                              custom={index}
                              variants={rowVariant}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              key={employee.id}
                              onClick={() => handleEmployeeClick(employee)}
                              sx={{
                                display: "grid",
                                gridTemplateColumns: employeeGridColumns,
                                alignItems: "center",
                                minHeight: 41,
                                px: 1.5,
                                borderBottom:
                                  index === paginatedEmployees.length - 1
                                    ? "none"
                                    : "1px solid #F0F2F4",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                                "&:hover": { background: "#FAFCFB" },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.7,
                                  minWidth: 0,
                                  overflow: "hidden",
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background:
                                      avatarColors[index % avatarColors.length],
                                    flexShrink: 0,
                                  }}
                                >
                                  {employee.avatar}
                                </Avatar>

                                <Box
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Tooltip
                                    title={employee.name}
                                    placement="top-start"
                                    arrow
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "#27313C",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "block",
                                      }}
                                    >
                                      {employee.name}
                                    </Typography>
                                  </Tooltip>

                                  <Tooltip
                                    title={employee.email}
                                    placement="bottom-start"
                                    arrow
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: 10,
                                        color: "#9299A2",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "block",
                                      }}
                                    >
                                      {employee.email}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                              </Box>

                              <Typography
                                sx={{
                                  fontSize: 9.8,
                                  color: "#52606D",
                                  fontWeight: 500,
                                }}
                              >
                                EM{employee.id}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 9.7,
                                  color: "#4A5561",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {employee.username}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 9.7,
                                  color: "#4A5561",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {employee.department}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 9.7,
                                  color: "#4A5561",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {employee.role}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 9.7,
                                  color: "#4A5561",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {employee.branch}
                              </Typography>

                              <Box>
                                <TypeChip type={employee.type} />
                              </Box>
                              <Box>
                                <StatusChip status={employee.status} />
                              </Box>

                              <Typography
                                sx={{ fontSize: 9.7, color: "#4A5561" }}
                              >
                                {employee.joined}
                              </Typography>

                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                {canEditEmployee && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/Employee-Registration?empId=${employee.id}&mode=edit`,
                                      );
                                    }}
                                    sx={{
                                      color: "#64748B",
                                      "&:hover": {
                                        color: "#073F35",
                                        background: "#EDF9F5",
                                      },
                                    }}
                                  >
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                )}

                                {canViewEmployee && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/Employee-Registration?empId=${employee.id}&mode=view`,
                                      );
                                    }}
                                    sx={{
                                      color: "#64748B",
                                      "&:hover": {
                                        color: "#0867E8",
                                        background: "#EEF5FF",
                                      },
                                    }}
                                  >
                                    <VisibilityOutlinedIcon
                                      sx={{ fontSize: 16 }}
                                    />
                                  </IconButton>
                                )}

                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEmployee(employee.id);
                                  }}
                                  sx={{
                                    color: "#EF4444",
                                    "&:hover": {
                                      color: "#DC2626",
                                      background: "#FEE2E2",
                                    },
                                  }}
                                >
                                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </AnimatePresence>
                      )}
                    </Box>

                    {!loading && filteredEmployees.length === 0 && (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        sx={{ py: 5, textAlign: "center" }}
                      >
                        <Typography sx={{ fontSize: 13, color: "#8A929B" }}>
                          No employees found
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {filteredEmployees.length > 0 && (
                  <CustomPagination
                    page={page}
                    totalItems={filteredEmployees.length}
                    itemsPerPage={rowsPerPage}
                    onPageChange={(nextPage) => setPage(nextPage)}
                  />
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      <PremiumSnackbar
        open={snackbar.open}
        setOpen={(isOpen) => setSnackbar((prev) => ({ ...prev, open: isOpen }))}
        type={snackbar.severity}
        title={
          snackbar.severity === "success"
            ? "Success!"
            : snackbar.severity === "error"
              ? "Error!"
              : "Info"
        }
        message={snackbar.message}
      />

      <Dialog
        open={importResult.open}
        onClose={() => setImportResult({ open: false, data: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#111827", pb: 1 }}>
          Import Summary
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          {importResult.data && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {importResult.data.error_count === 0 ? (
                <Alert severity="success" sx={{ borderRadius: "8px" }}>
                  Data Imported Successfully! All{" "}
                  {importResult.data.created_count} records were saved.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ borderRadius: "8px" }}>
                  Import completed with errors. Some records were not saved.
                </Alert>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Chip
                  label={`Total Rows: ${importResult.data.total_rows}`}
                  sx={{ background: "#F3F4F6", fontWeight: 600 }}
                />
                <Chip
                  label={`Successfully Created: ${importResult.data.created_count}`}
                  sx={{
                    background: "#E4F8F1",
                    color: "#15956E",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={`Failed: ${importResult.data.error_count}`}
                  sx={{
                    background: "#FFE5E7",
                    color: "#E64A55",
                    fontWeight: 600,
                  }}
                />
              </Box>

              {importResult.data.error_count > 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    mt: 1,
                    p: 2,
                    border: "1px dashed #D1D5DB",
                    borderRadius: "8px",
                    background: "#F9FAFB",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.9rem", color: "#4B5563", mb: 2 }}
                  >
                    Download the error report to see exact reasons for failure.
                    Fix the data in the file and upload it again.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={handleDownloadErrorReport}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "8px",
                    }}
                  >
                    Download Failed Records (CSV)
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, background: "#F9FAFB" }}>
          <Button
            onClick={() => setImportResult({ open: false, data: null })}
            variant="contained"
            sx={{
              background: "#073F35",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              "&:hover": { background: "#052d26" },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}