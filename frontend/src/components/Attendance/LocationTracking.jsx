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
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { API_BASE_URL } from "../../Config/api";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Map from "./Map";


// const attendanceData = [
//     {
//         time: "06:52 AM",
//         type: "REMOTE CLOCK IN",
//         color: "#20b486",
//         letter: "A",
//         lat: "18.500047,73.758391",
//     },
//     {
//         time: "18:45 PM",
//         type: "REMOTE CLOCK IN",
//         color: "#ef4444",
//         letter: "B",
//         lat: "18.500037,73.758391",
//     },
//     {
//         time: "9:10 AM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "C",
//         lat: "18.500047,73.758394",
//     },
//     {
//         time: "10:10 AM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "D",
//         lat: "18.500157,73.758394",
//     },
//     {
//         time: "11:10 AM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "E",
//         lat: "18.500147,73.758392",
//     },
//     {
//         time: "12:10 PM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "F",
//         lat: "18.500297,73.758391",
//     },
//     {
//         time: "1:10 PM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "G",
//         lat: "18.500397,73.758391",
//     },
//     {
//         time: "2:10 PM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "H",
//         lat: "18.500497,73.758391",
//     },
//     {
//         time: "3:10 PM",
//         type: "LOCATION PUNCH",
//         color: "#20b486",
//         letter: "I",
//         lat: "18.500597,73.758391",
//     },
// ];

const LocationTracking = ({
    open,
    onClose,
    employee,
}) => {

    console.log(employee, 'employee');
    if (!employee) return null;


    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    console.log(employee, "employee");


    useEffect(() => {
        if (!employee) return;
        console.log('asjdhu');

        fetchPunchDetails();
    }, [employee]);

    const formatPunchTime = (dateTime) => {
    if (!dateTime) return "-";

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};
    const fetchPunchDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const employeeId =
                employee?.emp_id
            console.log(employeeId, 'jaidjqwo');

            if (!employeeId) {
                setError("Employee ID not found");
                setAttendanceData([]);
                return;
            }

            // Employee/date ke according dynamic date
            const selectedDate =
                employee?.attendance_date ||
                employee?.date ||
                new Date().toISOString().split("T")[0];

            const response = await axios.get(
                `${API_BASE_URL}/hrm_web/punch_detail/`,
                {
                    params: {
                        employee_id: employeeId,
                        date: selectedDate,
                    },
                }
            );

            console.log("Punch Detail API:", response.data);

            if (response?.data?.status) {
                const apiData = response?.data?.data;

                const records = Array.isArray(apiData)
                    ? apiData
                    : apiData
                        ? [apiData]
                        : [];

                const mappedData = [];

                records.forEach((record) => {

                    // CLOCK IN
                    if (record?.clock_in) {
                        mappedData.push({
                            time: formatPunchTime(record.clock_in),
                            type: "CLOCK IN",
                            color: "#20b486",
                            letter: "IN",
                            lat:
                                record?.clockin_latitude != null &&
                                    record?.clockin_longitude != null
                                    ? `${record.clockin_latitude},${record.clockin_longitude}`
                                    : "-",
                            latitude: record?.clockin_latitude,
                            longitude: record?.clockin_longitude,
                        });
                    }
                    if (record?.clock_out) {
                        mappedData.push({
                            time: formatPunchTime(record.clock_out),
                            type: "CLOCK OUT",
                            color: "#ef4444",
                            letter: "OUT",
                            lat:
                                record?.clockout_latitude != null &&
                                    record?.clockout_longitude != null
                                    ? `${record.clockout_latitude},${record.clockout_longitude}`
                                    : "-",
                            latitude: record?.clockout_latitude,
                            longitude: record?.clockout_longitude,
                        });
                    }
                    // CLOCK OUT
                    // if (record?.clock_out) {
                    //     mappedData.push({
                    //         time: formatPunchTime(record.clock_out),
                    //         type: "CLOCK OUT",
                    //         color: "#ef4444",
                    //         letter: "OUT",
                    //         lat:
                    //             record?.clockout_latitude != null &&
                    //                 record?.clockout_longitude != null
                    //                 ? `${record.clockout_latitude},${record.clockout_longitude}`
                    //                 : "-",
                    //         latitude: record?.clockout_latitude,
                    //         longitude: record?.clockout_longitude,
                    //     });
                    // }

                    // FUTURE: If API provides punch details array
                    if (Array.isArray(record?.punch_details)) {
                        record.punch_details.forEach((punch) => {
                            mappedData.push({
                                time: formatPunchTime(
                                    punch?.punch_datetime || punch?.punch_datetime
                                ),
                                type:
                                    punch?.type ||
                                    punch?.punch_type ||
                                    "LOCATION PUNCH",
                                color: "#6366f1",
                                letter:
                                    punch?.letter ||
                                    String.fromCharCode(
                                        65 + mappedData.length
                                    ),
                                lat:
                                    punch?.latitude != null &&
                                        punch?.longitude != null
                                        ? `${punch.latitude},${punch.longitude}`
                                        : "-",
                                latitude: punch?.latitude,
                                longitude: punch?.longitude,
                            });
                        });
                    }
                });
                console.log(mappedData, 'mappedData');

                setAttendanceData(mappedData);
            } else {
                setAttendanceData([]);
                setError(
                    response?.data?.message ||
                    "No attendance data found"
                );
            }
        } catch (err) {
            console.error("Punch Detail API Error:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to fetch attendance details"
            );

            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            transitionDuration={280}
            ModalProps={{
                keepMounted: true,
                sx: {
                    zIndex: 3000,
                },
            }}
            sx={{
                width: '700px',
                "& .MuiDrawer-paper": {
                    width: {
                        xs: "100vw",
                        sm: "420px",
                        md: "70%!important",
                    },

                    height: {
                        xs: "100vh",
                        sm: "calc(100vh - 130px)",
                    },

                    top: {
                        xs: 0,
                        sm: "90px",
                    },

                    right: {
                        xs: 0,
                        sm: "12px",
                    },

                    position: "fixed",

                    boxSizing: "border-box",

                    borderRadius: {
                        xs: 0,
                        sm: "20px",
                    },

                    overflow: "hidden",

                    backgroundColor: "#FFFFFF",

                    border: {
                        xs: "none",
                        sm: "1px solid #E9EDF2",
                    },

                    boxShadow: {
                        xs: "none",
                        sm: "0px 8px 30px rgba(16, 24, 40, 0.16)",
                    },

                    display: "flex",
                    flexDirection: "column",
                },
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: "rgba(15, 23, 42, 0.20)",
                    },
                },
            }}
        >
            {/* HEADER */}

            <Box
                sx={{
                    height: "38px",
                    minHeight: "38px",
                    px: 1.1,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #EEF1F4",
                }}
            >
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        width: 22,
                        height: 22,
                        mr: 0.7,
                        color: "#667085",

                        "&:hover": {
                            backgroundColor: "#F5F7F9",
                        },
                    }}
                >
                    <ArrowBackIosNewIcon
                        sx={{
                            fontSize: "1vw",
                        }}
                    />
                </IconButton>

                <Typography
                    sx={{
                        fontSize: "1.2vw",
                        fontWeight: 700,
                        color: "#17202A",
                        width: '700px'
                    }}
                >
                    Location Tracking
                </Typography>
            </Box>

            {/* CONTENT */}

            <Box
                sx={{
                    width: "100%",
                    height: "100vh",
                    minHeight: 500,
                    position: "relative",
                    overflow: "hidden",
                    // background: "#e9e4db",
                }}
            >
                {/* HEADER */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 34,
                        background: "#fff",
                        zIndex: 20,
                        display: "flex",
                        alignItems: "center",
                        px: 1.2,
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "1vw",
                            fontWeight: 700,
                            color: "#303030",
                        }}
                    >
                        MAP VIEW - {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                        }).toUpperCase()}
                    </Typography>

                    <IconButton
                        size="small"
                        sx={{
                            position: "absolute",
                            right: 5,
                            width: 20,
                            height: 20,
                            border: "1px solid #ddd",
                            background: "#fff",
                            "&:hover": {
                                background: "#f5f5f5",
                            },
                        }}
                    >
                        <CloseIcon onClick={onClose} sx={{ fontSize: 13 }} />
                    </IconButton>
                </Box>
                {/* LEFT ATTENDANCE PANEL */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 34,
                        left: 0,
                        bottom: 0,
                        width: 175,
                        background: "#fff",
                        zIndex: 15,
                        boxShadow: "2px 0 8px rgba(0,0,0,.08)",
                        overflowY: "auto",

                        "&::-webkit-scrollbar": {
                            width: 3,
                        },

                        "&::-webkit-scrollbar-thumb": {
                            background: "#bbb",
                            borderRadius: 5,
                        },
                    }}
                >
                    {/* Employee */}
                    <Box sx={{ px: 7 / 8, pt: 1.2, pb: 0.8 }}>
                        <Typography
                            sx={{
                                fontSize: '.9vw',
                                fontWeight: 700,
                                color: "#333",
                                textTransform: "uppercase",
                            }}
                        >
                            {employee?.name || "-"}
                        </Typography>

                        {/* <Typography
                            sx={{
                                fontSize: 6,
                                color: "#aaa",
                                mt: 0.3,
                            }}
                        >
                            EMP-0142 · Emergency Response
                        </Typography> */}
                    </Box>

                    <Divider />

                    {/* Attendance Sections */}
                    {attendanceData.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                position: "relative",
                                px: 1,
                                py: 0.65,
                                borderBottom:
                                    index === 1
                                        ? "1px solid #eee"
                                        : "none",
                            }}
                        >
                            {index === 0 && (
                                <Typography
                                    sx={{
                                        fontSize: '.8vw',
                                        color: "#aaa",
                                        mb: 0.7,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    REMOTE CLOCK IN
                                </Typography>
                            )}

                            {index === 2 && (
                                <Typography
                                    sx={{
                                        fontSize: '.7vw',
                                        color: "#aaa",
                                        mb: 0.7,
                                        mt: 0.5,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    LOCATION PUNCH
                                </Typography>
                            )}

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    {item.color === "#20b486" ? (
                                        <KeyboardArrowUpIcon
                                            sx={{
                                                fontSize: '1.2vw',
                                                color: item.color,
                                            }}
                                        />
                                    ) : (
                                        <KeyboardArrowDownIcon
                                            sx={{
                                                fontSize: '1.2vw',
                                                color: item.color,
                                            }}
                                        />
                                    )}
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        sx={{
                                            fontSize: '.9vw',
                                            fontWeight: 700,
                                            color: "#333",
                                        }}
                                    >
                                        {item.time}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: '.6rem',
                                            color: "#aaa",
                                            mt: 0.2,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {item.lat}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        background: "#5d687c",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: '.6vw',
                                        fontWeight: 700,
                                    }}
                                >
                                    {item.letter}
                                </Box>
                            </Box>
                        </Box>
                    ))}

                    {/* Bottom Legend */}
                    <Box
                        sx={{
                            position: "sticky",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "#fff",
                            borderTop: "1px solid #eee",
                            px: 1,
                            py: 0.8,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                                mb: 0.35,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#ef4444",
                                }}
                            />

                            <Typography sx={{ fontSize: '.8vw' }}>
                                Clock In
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                                mb: 0.35,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#20b486",
                                }}
                            />

                            <Typography sx={{ fontSize: '.8vw' }}>
                                Clock Out
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#6366f1",
                                }}
                            />

                            <Typography sx={{ fontSize: '.8vw' }}>
                                Location Punch
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        top: 34,
                        left: 115,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#E8E4DC",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
   <Typography
                        sx={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#303030",
                        }}
                    >
                        Map 
                    </Typography>
                     <Box sx={{ width: "100%", height: "100%" }}>
        <Map data={attendanceData} />
    </Box>

                </Box>
            </Box>
        </Drawer>
    );
};


export default LocationTracking;