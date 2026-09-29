import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Stack,
    Avatar,
    IconButton,
    Divider,
    Chip,
} from "@mui/material";
import axios from "axios";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from "@mui/icons-material/EventNote";
import { API_BASE_URL } from "../../Config/api";

/* ============================================================
   GRID COLUMNS LAYOUT
============================================================ */
const ATTENDANCE_GRID_COLUMNS =
    "45px minmax(65px, 1fr) minmax(65px, 1fr) 50px minmax(55px, 1fr) minmax(65px, 1fr) minmax(75px, 1.2fr) 24px";

const AttendanceDetailsDrawer = ({ open, onClose, employee }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [summary, setSummary] = useState({
        avg_effective_hours: "0h 0m",
        late_arrivals: 0,
        on_time_arrivals: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "late":
                return "#D99100";
            case "present":
                return "#16A34A";
            case "half day":
                return "#2563EB";
            case "absent":
                return "#DC2626";
            case "on leave":
                return "#D97706";
            default:
                return "#16A34A";
        }
    };

    const statusColor = getStatusColor(employee?.status);

    useEffect(() => {
        if (!open || !employee) return;
        fetchAttendance();
    }, [open, employee]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const employeeId =
                employee?.emp_id ||
                employee?.employee_id ||
                employee?.employee ||
                employee?.id;

            if (!employeeId) {
                setError("Employee ID not found");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/hrm_web/attendance_ID/`,
                {
                    params: {
                        employee_id: employeeId,
                        date_filter: "this_month",
                    },
                }
            );

            if (response?.data?.status) {
                setSummary(
                    response.data.summary || {
                        avg_effective_hours: "0h 0m",
                        late_arrivals: 0,
                        on_time_arrivals: 0,
                    }
                );
                const mappedData = mapAttendanceData(response.data.data || []);
                setAttendanceData(mappedData);
            } else {
                setAttendanceData([]);
            }
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to fetch attendance data"
            );
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const mapAttendanceData = (data) => {
        return data.map((item) => {
            const date = new Date(item.attendance_date);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            const formattedDate = date.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
            });

            const isLeave = Boolean(
                item.leave ||
                item.attendance_status?.toLowerCase().includes("leave") ||
                item.leave_type
            );

            return {
                attendanceId: item.attendance_id,
                employeeName: item.employee_name,
                employeeCode: item.employee_code,
                departmentName: item.department_name,
                date: formattedDate,
                day,
                startTime: formatTime(item.first_login),
                startTime2: formatTime(item.last_logout),
                actualHours: formatWorkingHours(item.working_hours),
                break: formatWorkingHours(item.break_time),
                totalHours: formatWorkingHours(item.working_hours),
                standDown: formatWorkingHours(item.overtime_hours),
                arrival: formatLateMinutes(item.late_minutes),
                isLate: Number(item.late_minutes || 0) > 0,
                isWeeklyOff: item.is_weekly_off || item.attendance_status === "Weekly Off",
                isHoliday: item.is_holiday || item.attendance_status === "Holiday",
                isLeave,
                leaveType: item.leave_type || item.leave_details?.leave_type || "Casual Leave",
                leaveReason: item.leave_reason || item.leave_details?.reason || "On Leave",
                type: isLeave ? "leave" : "attendance",
            };
        });
    };

    const formatTime = (value) => {
        if (!value) return null;
        const date = new Date(value);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatWorkingHours = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) return value;
        const hours = Math.floor(numericValue);
        const minutes = Math.round((numericValue - hours) * 60);
        if (hours === 0 && minutes === 0) return "0m";
        if (hours === 0) return `${minutes}m`;
        return `${hours}h ${minutes}m`;
    };

    const formatLateMinutes = (minutes) => {
        if (minutes === null || minutes === undefined) return "-";
        const value = Number(minutes);
        if (!value) return "On Time";
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        return hours > 0 ? `${hours}:${mins}:00 late` : `0:${mins}:34 late`;
    };

    const getInitials = (name = "") => {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "NA";
    };

    if (!employee) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            transitionDuration={280}
            ModalProps={{
                keepMounted: true,
                sx: { zIndex: 3000 },
            }}
            sx={{
                "& .MuiDrawer-paper": {
                    width: { xs: "100vw", sm: "480px", md: "560px" },
                    height: "100vh",
                    position: "fixed",
                    boxSizing: "border-box",
                    borderRadius: { xs: 0, sm: "20px 0 0 20px" },
                    overflow: "hidden",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0px 8px 30px rgba(16, 24, 40, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            {/* HEADER */}
            <Box
                sx={{
                    height: "48px",
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #F0F2F5",
                }}
            >
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ mr: 1, color: "#667085" }}
                >
                    <ArrowBackIosNewIcon sx={{ fontSize: "0.85rem" }} />
                </IconButton>
                <Typography
                    sx={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#1D2939",
                    }}
                >
                    Attendance Logs
                </Typography>
            </Box>

            {/* BODY CONTENT */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 2.5,
                    py: 2,
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#EAECF0",
                        borderRadius: "10px",
                    },
                }}
            >
                {/* EMPLOYEE INFO HEADER */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2, width: "100%" }}
                >
                    {/* Left side - Avatar + Name */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                            mb: 2,
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 42,
                                height: 42,
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                backgroundColor: "#113A2E",
                                color: "#FFFFFF",
                            }}
                        >
                            {getInitials(employee?.name || employee?.employee_name)}
                        </Avatar>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: "#1D2939",
                                    lineHeight: 1.2,
                                    ml:1
                                }}
                            >
                                {employee?.name || employee?.employee_name || "-"}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: "0.75rem",
                                    color: "#667085",
                                    mt: 0.2,
                                    lineHeight: 1.2,
                                    ml:1
                                }}
                            >
                                {employee?.department || "-"} -{" "}
                                {employee?.employee_code || "-"}
                            </Typography>
                        </Box>

                        <Chip
                            size="small"
                            label={employee?.status || ""}
                            sx={{
                                position: "absolute",
                                right: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: 24,
                                borderRadius: "12px",
                                backgroundColor: "#E6F4EA",
                                color: statusColor,
                                fontWeight: 600,
                                fontSize: "0.72rem",
                            }}
                        />
                    </Stack>

                    {/* Right side - Status */}

                </Stack>

                {/* SUMMARY CARDS */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 1.2,
                        mb: 2.5,
                    }}
                >
                    <SummaryCard
                        value={summary?.avg_effective_hours || "-"}
                        label="Avg Eff. Hours"
                        valueColor="#1D2939"
                    />
                    <SummaryCard
                        value={`${summary?.late_arrivals ?? '-'} days`}
                        label="Late Arrivals"
                        valueColor="#D97706"
                    />
                    <SummaryCard
                        value={`${summary?.on_time_arrivals ?? '-'}%`}
                        label="On Time Arrival"
                        valueColor="#16A34A"
                    />
                </Box>

                {/* TABLE HEADER */}
                <AttendanceTableHeader />

                <Divider sx={{ borderColor: "#EAECF0", mb: 1 }} />

                {/* LOG LIST */}
                {loading && (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: "#667085" }}>
                            Loading attendance logs...
                        </Typography>
                    </Box>
                )}

                {!loading && error && (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: "#D92D20" }}>
                            {error}
                        </Typography>
                    </Box>
                )}

                {!loading && !error && (
                    <Stack spacing={0.5}>
                        {attendanceData.length > 0 ? (
                            attendanceData.map((log, index) => (
                                <React.Fragment key={log.attendanceId || index}>
                                    {log.isWeeklyOff ? (
                                        <SpecialDayRow label="Full day Weekly-off!" type="off" date={log.date} day={log.day} />
                                    ) : log.isHoliday ? (
                                        <SpecialDayRow label="Holiday" type="holiday" date={log.date} day={log.day} />
                                    ) : log.isLeave ? (
                                        <LeaveLogRow
                                            date={log.date}
                                            day={log.day}
                                            leaveType={log.leaveType}
                                            reason={log.leaveReason}
                                        />
                                    ) : (
                                        <AttendanceLogRow log={log} />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <EmptyAttendance />
                        )}
                    </Stack>
                )}
            </Box>
        </Drawer>
    );
};

/* ============================================================
   SUMMARY CARD COMPONENT
============================================================ */
const SummaryCard = ({ value, label, valueColor = "#1D2939" }) => (
    <Box
        sx={{
            py: 1.2,
            px: 1,
            borderRadius: "8px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: valueColor, lineHeight: 1.2 }}>
            {value}
        </Typography>
        <Typography sx={{ fontSize: "0.65rem", color: "#667085", mt: 0.3, lineHeight: 1 }}>
            {label}
        </Typography>
    </Box>
);

/* ============================================================
   TABLE HEADER COMPONENT
============================================================ */
const AttendanceTableHeader = () => {
    const headers = [
        "Date",
        "Start Time",
        "Actual\nCrew Hrs",
        "Break",
        "Total HRS",
        "Stand Down",
        "Arrival",
        "Log",
    ];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: ATTENDANCE_GRID_COLUMNS,
                alignItems: "center",
                width: "100%",
                py: 0.8,
                columnGap: "4px",
                boxSizing: "border-box",
            }}
        >
            {headers.map((title) => (
                <Typography
                    key={title}
                    sx={{
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        color: "#667085",
                        whiteSpace: "pre-line",
                        lineHeight: 1.15,
                    }}
                >
                    {title}
                </Typography>
            ))}
        </Box>
    );
};

/* ============================================================
   ATTENDANCE LOG ROW COMPONENT
============================================================ */
const AttendanceLogRow = ({ log }) => {
    const isLate = log.isLate;

    return (
        <Box
            sx={{
                minHeight: "36px",
                display: "grid",
                gridTemplateColumns: ATTENDANCE_GRID_COLUMNS,
                alignItems: "center",
                columnGap: "4px",
                py: 0.6,
                borderBottom: "1px solid #F2F4F7",
            }}
        >
            <Box>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#344054", lineHeight: 1.1 }}>
                    {log.date || "-"}
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "#98A2B3", lineHeight: 1.1 }}>
                    {log.day || ""}
                </Typography>
            </Box>

            <Stack spacing={0.2}>
                <TimeValue value={log.startTime || "-"} />
                <TimeValue value={log.startTime2 || "-"} />
            </Stack>

            <Stack spacing={0.2}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#344054" }}>
                    {log.actualHours || "-"}
                </Typography>
                {/* <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#344054" }}>
          {log.actualHours || "9h 22m"}
        </Typography> */}
            </Stack>

            <Typography sx={{ fontSize: "0.68rem", color: "#667085", whiteSpace: "nowrap" }}>
                {log.break || "-"}
            </Typography>

            <Typography sx={{ fontSize: "0.68rem", color: "#344054", fontWeight: 700, whiteSpace: "nowrap" }}>
                {log.totalHours || "-"}
            </Typography>

            <Typography sx={{ fontSize: "0.68rem", color: "#667085", whiteSpace: "nowrap" }}>
                {log.standDown || "-"}
            </Typography>

            <Typography
                sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: isLate ? "#D97706" : "#16A34A",
                    whiteSpace: "nowrap",
                }}
            >
                {log.arrival || "-"}
            </Typography>

            <IconButton size="small" sx={{ padding: 0, color: "#10B981" }}>
                <CheckCircleIcon sx={{ fontSize: "0.9rem" }} />
            </IconButton>
        </Box>
    );
};

/* ============================================================
   LEAVE LOG ROW COMPONENT (ADDED)
============================================================ */
const LeaveLogRow = ({ date, day, leaveType = "Casual Leave", reason = "On Leave" }) => {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: ATTENDANCE_GRID_COLUMNS,
                alignItems: "center",
                columnGap: "4px",
                py: 0.6,
                borderBottom: "1px solid #F2F4F7",
            }}
        >
            <Box>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#344054", lineHeight: 1.1 }}>
                    {date || "-"}
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "#98A2B3", lineHeight: 1.1 }}>
                    {day || ""}
                </Typography>
            </Box>

            <Box
                sx={{
                    gridColumn: "span 7",
                    py: 0.6,
                    px: 1.5,
                    borderRadius: "6px",
                    backgroundColor: "#FEF3F2",
                    border: "1px solid #FECDCA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <EventNoteIcon sx={{ fontSize: "0.85rem", color: "#D92D20" }} />
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#B42318" }}>
                        {leaveType}
                    </Typography>
                </Stack>
                <Typography sx={{ fontSize: "0.65rem", color: "#B42318", fontStyle: "italic" }}>
                    {reason}
                </Typography>
            </Box>
        </Box>
    );
};

/* ============================================================
   TIME VALUE DOT COMPONENT
============================================================ */
const TimeValue = ({ value }) => {
    if (!value) return null;

    return (
        <Stack direction="row" alignItems="center" spacing={0.4}>
            <Box
                sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                }}
            />
            <Typography
                sx={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "#10B981",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                }}
            >
                {value}
            </Typography>
        </Stack>
    );
};

/* ============================================================
   SPECIAL DAY / HOLIDAY ROW COMPONENT
============================================================ */
const SpecialDayRow = ({ label, type = "off", date, day }) => {
    const isHoliday = type === "holiday";

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: ATTENDANCE_GRID_COLUMNS,
                alignItems: "center",
                columnGap: "4px",
                py: 0.6,
                borderBottom: "1px solid #F2F4F7",
            }}
        >
            <Box>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#344054", lineHeight: 1.1 }}>
                    {date || "Jul 05"}
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "#98A2B3", lineHeight: 1.1 }}>
                    {day || "Fri"}
                </Typography>
            </Box>

            <Box
                sx={{
                    gridColumn: "span 7",
                    py: 0.6,
                    px: 2,
                    borderRadius: "6px",
                    backgroundColor: isHoliday ? "#E6F4EA" : "#F8F9FA",
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "0.68rem",
                        fontWeight: 500,
                        color: isHoliday ? "#16A34A" : "#98A2B3",
                    }}
                >
                    {label}
                </Typography>
            </Box>
        </Box>
    );
};

/* ============================================================
   EMPTY STATE COMPONENT
============================================================ */
const EmptyAttendance = () => (
    <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.75rem", color: "#98A2B3" }}>
            No attendance logs found
        </Typography>
    </Box>
);

export default AttendanceDetailsDrawer;