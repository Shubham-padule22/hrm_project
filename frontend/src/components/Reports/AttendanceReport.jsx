import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  MenuItem,
  Select,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion"; // AnimatePresence hata diya for better table layout
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import axiosInstance from "../../Config/axiosInstance";
import CustomPagination from "../common/Custompagination"; 
import PremiumSnackbar from "../common/PremiumSnackbar"; 

// Dark Green theme color
const THEME_GREEN = "#0E3E30";

const getAvatarColor = (name) => {
  if (!name) return THEME_GREEN;
  const colors = [THEME_GREEN, "#3B82F6", "#8B5CF6", "#EF4444", "#F59E0B", "#14B8A6"];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const AttendanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success", 
    message: "",
  });

  // Filters State
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State 
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchReportData = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/hrm_web/AttendanceReportGet/`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      setReportData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching report data from API:", error);
      setReportData([]);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to fetch attendance records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    } else {
      setReportData([]);
    }
  }, [startDate, endDate]);

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      setSnackbar({
        open: true,
        severity: "info",
        message: "Please select start and end dates to export data.",
      });
      return;
    }

    try {
      setExporting(true);
      const response = await axiosInstance.get(`/hrm_web/AttendanceReportGet/`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          export: "excel",
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        severity: "success",
        message: "Excel report downloaded successfully.",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to download the excel report.",
      });
    } finally {
      setExporting(false);
    }
  };

  // Reset Filters Function
  const handleResetFilters = () => {
    setSearch("");
    setDepartmentFilter("All");
    setStartDate("");
    setEndDate("");
    setPage(1); 
  };

  const uniqueDepartments = ["All", ...new Set(reportData.map((row) => row.department).filter(Boolean))];

  // Apply Filters
  const filteredData = reportData.filter((row) => {
    const firstName = row.first_name || "";
    const lastName = row.last_name || "";
    const dept = row.department || "";

    const matchesSearch =
      firstName.toLowerCase().includes(search.toLowerCase()) ||
      lastName.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === "All" || dept === departmentFilter;

    return matchesSearch && matchesDept;
  });

  // Generate Data for the current Page 
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pt: 2, pb: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* BREADCRUMBS */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <CustomBreadcrumbs />
        </motion.div>

        {/* TOP CARD: FILTERS & SEARCH */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            p: { xs: 2, md: 2.5 },
            mb: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            overflow: "hidden"
          }}
        >
          <Stack 
            direction={{ xs: "column", lg: "row" }} 
            alignItems={{ xs: "stretch", lg: "center" }} 
            justifyContent="space-between"
            spacing={2} 
            sx={{ width: "100%" }}
          >
            <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: "wrap", alignItems: "center", useFlexGap: true }}>
              
              {/* Search Button */}
              <Box
                sx={{
                  bgcolor: THEME_GREEN,
                  borderRadius: "8px",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#0A2B22" },
                  flexShrink: 0
                }}
              >
                <SearchIcon sx={{ color: "white" }} />
              </Box>

              {/* Search Input */}
              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); 
                }}
                placeholder="Search Employee..."
                variant="outlined"
                sx={{
                  flex: { xs: "1 1 100%", sm: "1 1 auto" },
                  maxWidth: { xs: '100%', md: 260 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F9FAFB",
                    borderRadius: "8px",
                    height: 48,
                    fontSize: "0.875rem",
                    "& fieldset": { border: "1px solid #E5E7EB" },
                  },
                }}
              />

              {/* Department Dropdown */}
              <Select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1); 
                }}
                displayEmpty
                sx={{
                  minWidth: { xs: "100%", sm: 160 },
                  flex: "1 1 auto",
                  bgcolor: "#F9FAFB",
                  borderRadius: "8px",
                  height: 48,
                  fontSize: "0.875rem",
                  "& fieldset": { border: "1px solid #E5E7EB" },
                }}
              >
                {uniqueDepartments.map((dept, index) => (
                  <MenuItem key={index} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </MenuItem>
                ))}
              </Select>

              {/* Start Date */}
              <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: { xs: "100%", sm: 140 },
                  flex: "1 1 auto",
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "brightness(0)", 
                    cursor: "pointer"
                  },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F9FAFB",
                    borderRadius: "8px",
                    height: 48,
                    fontSize: "0.875rem",
                    "& fieldset": { border: "1px solid #E5E7EB" },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, -9px) scale(0.75)",
                    backgroundColor: "#FFFFFF",
                    padding: "0 4px",
                  },
                }}
              />

              {/* End Date */}
              <TextField
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: { xs: "100%", sm: 140 },
                  flex: "1 1 auto",
                  "& input::-webkit-calendar-picker-indicator": {
                    filter: "brightness(0)",
                    cursor: "pointer"
                  },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#F9FAFB",
                    borderRadius: "8px",
                    height: 48,
                    fontSize: "0.875rem",
                    "& fieldset": { border: "1px solid #E5E7EB" },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, -9px) scale(0.75)",
                    backgroundColor: "#FFFFFF",
                    padding: "0 4px",
                  },
                }}
              />
            </Stack>

            {/* Action Buttons Stack */}
            <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: "flex-end", lg: "center" } }}>
              <Button
                onClick={handleResetFilters}
                startIcon={<RestartAltIcon fontSize="small" />}
                sx={{
                  color: "#6B7280",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  height: 48,
                  flexShrink: 0,
                  "&:hover": { bgcolor: "#F3F4F6", color: "#111827" },
                }}
              >
                Reset
              </Button>

              <Button
                onClick={handleExportExcel}
                disabled={exporting}
                startIcon={
                  exporting ? <CircularProgress size={16} /> : <FileDownloadOutlinedIcon fontSize="small" />
                }
                sx={{
                  color: "#4B5563",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  height: 48,
                  flexShrink: 0,
                  "&:hover": { bgcolor: "#F3F4F6", color: "#111827" },
                }}
              >
                {exporting ? "Exporting..." : "Export Excel"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* BOTTOM CARD: TABLE */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <TableContainer sx={{ maxHeight: "calc(100vh - 260px)", overflow: "auto" }}>
            <Table stickyHeader sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>EMPLOYEE</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>ID</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>DEPARTMENT</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>DATE</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>CLOCK IN</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>CLOCK OUT</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>BREAK TIME</TableCell>
                  <TableCell sx={{ backgroundColor: "#FFFFFF", fontWeight: 700, color: "#6B7280", fontSize: "0.75rem", borderBottom: "1px solid #E5E7EB" }}>TOTAL HRS</TableCell>
                </TableRow>
              </TableHead>

              {/* TableBody with Key forces remount on filter change, triggering the stagger effect */}
              <TableBody key={search + departmentFilter + page + startDate + endDate}>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={30} sx={{ color: THEME_GREEN }} />
                    </TableCell>
                  </TableRow>
                ) : (!startDate || !endDate) ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#6B7280" }}>
                      Please select a Start Date and End Date to view attendance records.
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#6B7280" }}>
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => {
                    const uniqueRowKey = row.sr_no ? `row-${row.sr_no}` : `idx-${index}`;
                    
                    return (
                      <motion.tr
                        key={uniqueRowKey}
                        initial={{ opacity: 0, y: 15 }} // Rows start slightly lower
                        animate={{ opacity: 1, y: 0 }}  // Rows slide up to normal position
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.04, // Stagger effect: har row thodi der baad aayegi
                          ease: "easeOut" 
                        }} 
                        style={{ borderBottom: "1px solid #F3F4F6", backgroundColor: "#FFFFFF" }}
                        whileHover={{ backgroundColor: "#F9FAFB" }}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                width: 34,
                                height: 34,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                bgcolor: getAvatarColor(row.first_name),
                              }}
                            >
                              {row.first_name ? row.first_name.charAt(0) : "U"}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                                {row.first_name} {row.last_name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                                {row.department || "—"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 500 }}>
                          EM{row.sr_no}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {row.department || "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {row.attendance_date || "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {row.clock_in ? row.clock_in.split(" ")[1] : "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {row.clock_out ? row.clock_out.split(" ")[1] : "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {row.break_time || "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", color: "#6B7280", fontWeight: 500 }}>
                          {row.total_hours || "—"}
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Custom Pagination Component */}
          <CustomPagination
            page={page}
            totalItems={filteredData.length}
            itemsPerPage={rowsPerPage}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </Paper>
      </Container>

      {/* Premium Snackbar Component */}
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
    </Box>
  );
};

export default AttendanceReport;