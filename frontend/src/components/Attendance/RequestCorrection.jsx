import { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Grid,
    Button,
    IconButton,
    Autocomplete,
} from "@mui/material";
import axiosInstance from "../../Config/axiosInstance";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import PremiumSnackbar from "../common/PremiumSnackbar";

const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        background: "#fff",

        "& fieldset": {
            borderColor: "#E4E7EC",
        },

        "&:hover fieldset": {
            borderColor: "#0B3029",
        },

        "&.Mui-focused fieldset": {
            borderColor: "#0B3029",
            borderWidth: 1,
        },
    },

    "& .MuiInputBase-input::placeholder": {
        color: "#98A2B3",
        opacity: 1,
    },

    "& .MuiFormHelperText-root": {
        marginLeft: 0,
        fontSize: "12px",
    },

    // Make native date calendar icon visible
    "& input[type='date']::-webkit-calendar-picker-indicator": {
        opacity: 1,
        cursor: "pointer",
    },
};
export default function RequestCorrection({ open, handleClose, setSnackbar, getAttendanceData, selectedAttendance }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        employeeName: "",
        date: "",
        clockInTime: "",
        clockOutTime: "",
        reason: "",
    });
    const isApprovalCorrection = Boolean(selectedAttendance?.attendanceId);

    const getInputDate = (value) => value ? String(value).slice(0, 10) : "";
    const getInputTime = (value) => {
        if (!value) return "";
        const match = String(value).match(/(?:T|\s)(\d{2}:\d{2})/);
        return match ? match[1] : String(value).slice(0, 5);
    };

    useEffect(() => {
        if (!open) return;

        if (!selectedAttendance) {
            setFormData({
                employeeName: null,
                date: "",
                clockInTime: "",
                clockOutTime: "",
                reason: "",
            });
            setErrors({});
            return;
        }

        setFormData({
            employeeName: {
                clg_id: selectedAttendance.emp_id,
                employee_name: selectedAttendance.name,
            },
            date: getInputDate(selectedAttendance.attendanceDate),
            clockInTime: getInputTime(selectedAttendance.firstLogin),
            clockOutTime: getInputTime(selectedAttendance.lastLogout),
            reason: selectedAttendance.remarks || "",
        });
        setErrors({});
    }, [open, selectedAttendance]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const [employeeslist, setEmployeesList] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);

    const getEmployees = async () => {
        try {
            setEmployeeLoading(true);

            const response = await axiosInstance.get(
                "/hrm_web/employees/"
            );

            if (response.data?.status) {
                setEmployeesList(response.data.data || []);
            } else {
                setEmployeesList([]);
            }
        } catch (error) {
            console.error(
                "Error fetching employees:",
                error
            );

            setEmployeesList([]);
        } finally {
            setEmployeeLoading(false);
        }
    };
    useEffect(() => {
        if (open) {
            getEmployees();
        }
    }, [open]);
    const validate = () => {
        const temp = {};

        if (!formData.employeeName) {
            temp.employeeName = "Employee Name is required";
        }

        if (!formData.date) {
            temp.date = "Date is required";
        }

        if (!formData.clockInTime) {
            temp.clockInTime = "Clock In Time is required";
        }

        if (!formData.clockOutTime) {
            temp.clockOutTime = "Clock Out Time is required";
        }

        if (!formData.reason.trim()) {
            temp.reason = "Reason for correction is required";
        } else if (formData.reason.trim().length < 5) {
            temp.reason = "Reason must be at least 5 characters";
        }

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const payload = {
                first_login: `${formData.date}T${formData.clockInTime}:00+05:30`,
                last_logout: `${formData.date}T${formData.clockOutTime}:00+05:30`,
                remarks: formData.reason.trim(),
            };

            const endpoint = isApprovalCorrection
                ? `/hrm_web/attendance/update/${selectedAttendance.attendanceId}/`
                : "/hrm_web/attendance/manual_create/";

            if (!isApprovalCorrection) {
                payload.employee = formData.employeeName?.clg_id;
                payload.attendance_date = formData.date;
            } else {
                payload.attendance_status = selectedAttendance.attendanceStatus || "present";
                payload.is_approved = 'approved';
                payload.approved_by = 1;
            }

            console.log("Manual Attendance Payload:", payload);

            const response = isApprovalCorrection
                ? await axiosInstance.put(endpoint, payload)
                : await axiosInstance.post(endpoint, payload);

            console.log("Manual Attendance Response:", response.data);

            if (response.data?.status) {

                // First show snackbar
                setSnackbar({
                    open: true,
                    type: "success",
                    title: "Success",
                    message:
                        response.data?.message ||
                        "Attendance correction submitted successfully.",
                });
                getAttendanceData();
                // Reset form
                setFormData({
                    employeeName: null,
                    date: "",
                    clockInTime: "",
                    clockOutTime: "",
                    reason: "",
                });

                setErrors({});

                // Close modal after snackbar state is set
                handleClose();

            } else {
                setSnackbar({
                    open: true,
                    type: "error",
                    title: "Submission Failed",
                    message:
                        response.data?.message ||
                        "Unable to submit attendance correction.",
                });
            }

        } catch (error) {
            console.error("Error submitting attendance correction:", error);

            setSnackbar({
                open: true,
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Something went wrong while submitting attendance correction.",
            });

        } finally {
            setLoading(false);
        }
    };
    return (
        <AnimatePresence>
            {open && (
                <Modal open={open} onClose={handleClose}>
                    <Box
                        sx={{
                            position: "fixed",
                            inset: 0,
                            bgcolor: "rgba(15,23,42,.35)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 0,
                        }}
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.8,
                                y: 40,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.8,
                                y: 30,
                            }}
                            transition={{
                                duration: 0.35,
                            }}
                        >
                            <Box
                                sx={{
                                    width: {
                                        xs: "calc(100vw - 32px)",
                                        sm: 640,
                                    },
                                    maxHeight: "90vh",
                                    overflowY: "auto",
                                    bgcolor: "#fff",
                                    borderRadius: "18px",
                                    boxShadow:
                                        "0 25px 60px rgba(0,0,0,.18)",
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        px: 3,
                                        // py: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderBottom: "1px solid #ECECEC",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: '700',
                                            fontSize: '22'
                                        }}
                                    >
                                        Manual Attendance Correction
                                    </Typography>

                                    <IconButton onClick={handleClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                {/* Form */}
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={1.5}>

                                        {/* Employee Name */}
                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Employee Name
                                                <span
                                                    style={{
                                                        color: "red",
                                                    }}
                                                >
                                                    {" "}*
                                                </span>
                                            </Typography>
                                            {isApprovalCorrection ? (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={formData.employeeName?.employee_name || ""}
                                                    InputProps={{ readOnly: true }}
                                                    sx={textFieldStyle}
                                                />
                                            ) : (
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={employeeslist}
                                                    loading={employeeLoading}
                                                    value={formData.employeeName}
                                                    onChange={(event, newValue) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            employeeName: newValue,
                                                        }));
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            employeeName: "",
                                                        }));
                                                    }}
                                                    getOptionLabel={(option) => option?.employee_name || ""}
                                                    isOptionEqualToValue={(option, value) => option?.clg_id === value?.clg_id}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select employee"
                                                            error={!!errors.employeeName}
                                                            helperText={errors.employeeName}
                                                            sx={textFieldStyle}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </Grid>

                                        {/* Date */}
                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Date
                                                <span
                                                    style={{
                                                        color: "red",
                                                    }}
                                                >
                                                    {" "}*
                                                </span>
                                            </Typography>

                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                InputProps={{ readOnly: isApprovalCorrection }}
                                                onChange={handleChange}
                                                error={!!errors.date}
                                                helperText={errors.date}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        {/* Clock In */}
                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Clock In Time
                                                <span
                                                    style={{
                                                        color: "red",
                                                    }}
                                                >
                                                    {" "}*
                                                </span>
                                            </Typography>

                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="time"
                                                name="clockInTime"
                                                value={
                                                    formData.clockInTime
                                                }
                                                onChange={handleChange}
                                                error={
                                                    !!errors.clockInTime
                                                }
                                                helperText={
                                                    errors.clockInTime
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        {/* Clock Out */}
                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Clock Out Time
                                                <span
                                                    style={{
                                                        color: "red",
                                                    }}
                                                >
                                                    {" "}*
                                                </span>
                                            </Typography>

                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="time"
                                                name="clockOutTime"
                                                value={
                                                    formData.clockOutTime
                                                }
                                                onChange={handleChange}
                                                error={
                                                    !!errors.clockOutTime
                                                }
                                                helperText={
                                                    errors.clockOutTime
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        {/* Reason */}
                                        <Grid item xs={12} size={12}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Reason for Correction
                                                <span
                                                    style={{
                                                        color: "red",
                                                    }}
                                                >
                                                    {" "}*
                                                </span>
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                size="small"

                                                multiline
                                                minRows={1}
                                                name="reason"
                                                value={formData.reason}
                                                onChange={handleChange}
                                                placeholder="Please provide a reason for attendance correction..."
                                                error={!!errors.reason}
                                                helperText={
                                                    errors.reason ||
                                                    `${formData.reason.length}/250`
                                                }
                                                inputProps={{
                                                    maxLength: 250,
                                                }}
                                                sx={{
                                                    ...textFieldStyle,
                                                    "& .MuiOutlinedInput-root":
                                                    {
                                                        ...textFieldStyle[
                                                        "& .MuiOutlinedInput-root"
                                                        ],
                                                        height: "auto",
                                                        alignItems:
                                                            "flex-start",
                                                    },
                                                    "& textarea": {
                                                        padding: "12px 0",
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Footer */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            mt: 4,
                                        }}
                                    >
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleClose}
                                            sx={{
                                                height: 40,
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                borderColor: "#E5E7EB",
                                                color: "#475569",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            fullWidth
                                            onClick={handleSubmit}
                                            variant="contained"
                                            disabled={loading}
                                            sx={{
                                                height: 40,
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                fontWeight: 700,
                                                background:
                                                    "linear-gradient(90deg,#DC1F30,#F04050)",
                                                boxShadow:
                                                    "0 10px 20px rgba(240,64,80,.35)",

                                                "&:hover": {
                                                    background:
                                                        "linear-gradient(90deg,#C9182A,#E62F42)",
                                                    transform:
                                                        "translateY(-2px)",
                                                },
                                            }}
                                        >
                                            {loading
                                                ? "Submitting..."
                                                : "Submit"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </motion.div>
                    </Box>
                </Modal>
            )}
        </AnimatePresence>
    );
}
