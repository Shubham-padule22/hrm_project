import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Avatar,
    IconButton,
    Button,
    Stack,
    Breadcrumbs,
    Link,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import axiosInstance from "../../Config/axiosInstance";

const SHIFT_TYPES = [
    {
        key: "Morning",
        label: "Morning",
        icon: <WbSunnyOutlinedIcon sx={{ color: "#FD8E13", fontSize: 20 }} />,
        avatarColor: "#FD8E13",
    },
    {
        key: "Night",
        label: "Night",
        icon: <DarkModeOutlinedIcon sx={{ color: "#6532FF", fontSize: 20 }} />,
        avatarColor: "#6532FF",
    },
];

export default function ViewRoster() {
    const [employees, setEmployees] = useState([]);
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [shiftRoster, setShiftRoster] = useState([]);

    // Fetch employees list
    const getEmployees = async () => {
        try {
            const response = await axiosInstance.get("/hrm_web/employees/");
            if (response.data?.status) {
                setEmployees(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Helper date formatting
    const formatApiDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDateHeader = (date) => {
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Generate week days (Mon-Sun)
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: String(date.getDate()).padStart(2, "0"),
            fullDate: date,
            apiDate: formatApiDate(date),
        };
    });

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Fetch roster shift data
    const getShiftRoster = async () => {
        try {
            const response = await axiosInstance.get("/hrm_web/shift-roster/", {
                params: {
                    start_date: formatApiDate(weekStart),
                    end_date: formatApiDate(weekEnd),
                },
            });
            setShiftRoster(response.data.data || []);
        } catch (error) {
            console.error("Error fetching shift roster:", error);
            setShiftRoster([]);
        }
    };

    useEffect(() => {
        getEmployees();
    }, []);

    useEffect(() => {
        getShiftRoster();
    }, [weekStart]);

    const handlePreviousWeek = () => {
        setWeekStart((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 7);
            return d;
        });
    };

    const handleNextWeek = () => {
        setWeekStart((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 7);
            return d;
        });
    };

    // Match roster data with employees
    const getEmployeesForShiftAndDate = (shiftName, apiDate) => {
        const matchingRoster = shiftRoster.filter((item) => {
            const rosterShift = item.shift_name
                ? item.shift_name.replace(/\s+shift$/i, "")
                : "";
            return rosterShift === shiftName && item.roster_date === apiDate;
        });

        return matchingRoster.map((item) => {
            const emp = employees.find((e) => e.clg_id === item.employee);
            return {
                id: item.employee,
                name: emp?.employee_name || `Emp #${item.employee}`,
                initials: getInitials(emp?.employee_name || ""),
            };
        });
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

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "#f5f7fa",
                p: 2,
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
                    sx={{ mb: 1.5 }}
                >
                    <Link
                        underline="hover"
                        color="#626A75"
                        href="#"
                        sx={{ fontSize: "0.875rem" }}
                    >
                        Attendance
                    </Link>
                    <Link
                        underline="hover"
                        color="#626A75"
                        href="/hrm/Shift-Management"
                        sx={{ fontSize: "0.875rem" }}
                    >
                        Shift Management
                    </Link>
                    <Typography
                        color="#1D293D"
                        sx={{ fontSize: "0.875rem", fontWeight: 700 }}
                    >
                        View Roster
                    </Typography>
                </Breadcrumbs>
            </motion.div>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: "8px",
                    border: "1px solid #e7eaee",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                }}
            >
                {/* Header Bar */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2.5,
                        py: 1.5,
                        borderBottom: "1px solid #e7eaee",
                    }}
                >
                    <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#20252b" }}
                    >
                        Roster Planning — {formatDateHeader(weekStart)} -{" "}
                        {formatDateHeader(weekEnd)}
                    </Typography>

                    {/* Date Selector Pill */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #e2e5e8",
                            borderRadius: "20px",
                            px: 1,
                            py: 0.2,
                        }}
                    >
                        <IconButton size="small" onClick={handlePreviousWeek}>
                            <ChevronLeftIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Typography
                            sx={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "#4f5963",
                                px: 1,
                            }}
                        >
                            {formatDateHeader(weekStart)} - {formatDateHeader(weekEnd)}
                        </Typography>
                        <IconButton size="small" onClick={handleNextWeek}>
                            <ChevronRightIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Main Roster Grid */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "180px repeat(7, minmax(0, 1fr))",
                    }}
                >
                    {/* Header Top-Left Empty Cell */}
                    <Box
                        sx={{
                            p: 1.5,
                            borderRight: "1px solid #e7eaee",
                            borderBottom: "1px solid #e7eaee",
                            backgroundColor: "#f8f9fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#67717b" }}
                        >
                            Shift
                        </Typography>
                    </Box>

                    {/* Header Week Days (Mon - Sun) */}
                    {days.map((day) => (
                        <Box
                            key={day.apiDate}
                            sx={{
                                p: 1,
                                textAlign: "center",
                                borderRight: "1px solid #e7eaee",
                                borderBottom: "1px solid #e7eaee",
                                backgroundColor: "#f8f9fa",
                            }}
                        >
                            <Typography
                                sx={{ fontSize: "0.8rem", color: "#67717b", fontWeight: 600 }}
                            >
                                {day.day}
                            </Typography>
                            <Typography
                                sx={{ fontSize: "0.95rem", color: "#20252b", fontWeight: 700 }}
                            >
                                {day.date}
                            </Typography>
                        </Box>
                    ))}

                    {/* Shift Rows */}
                    {SHIFT_TYPES.map((shift) => (
                        <React.Fragment key={shift.key}>
                            {/* Left Column: Shift Name & Icon */}
                            <Box
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.2,
                                    borderRight: "1px solid #e7eaee",
                                    borderBottom: "1px solid #e7eaee",
                                }}
                            >
                                {shift.icon}
                                <Typography
                                    sx={{
                                        fontSize: "0.95rem",
                                        fontWeight: 700,
                                        color: "#20252b",
                                    }}
                                >
                                    {shift.label}
                                </Typography>
                            </Box>

                            {/* Days Grid for the Shift */}
                            {days.map((day) => {
                                const assignedEmps = getEmployeesForShiftAndDate(
                                    shift.key,
                                    day.apiDate
                                );

                                return (
                                    <Box
                                        key={`${shift.key}-${day.apiDate}`}
                                        sx={{
                                            p: 1.5,
                                            minHeight: 140,
                                            borderRight: "1px solid #e7eaee",
                                            borderBottom: "1px solid #e7eaee",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 0.8,
                                        }}
                                    >
                                        {assignedEmps.map((emp) => (
                                            <Stack
                                                key={emp.id}
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        fontSize: "0.65rem",
                                                        fontWeight: 700,
                                                        backgroundColor: shift.avatarColor,
                                                        color: "#fff",
                                                    }}
                                                >
                                                    {emp.initials}
                                                </Avatar>
                                                <Typography
                                                    noWrap
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        color: "#4f5963",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {emp.name}
                                                </Typography>
                                            </Stack>
                                        ))}

                                        {/* Add Inline Action Link */}
                                        {/* <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                        mt: 0.5,
                        cursor: "pointer",
                        color: "#919eab",
                        "&:hover": { color: "#637381" },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 12 }} />
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
                        Add
                      </Typography>
                    </Box> */}
                                    </Box>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}