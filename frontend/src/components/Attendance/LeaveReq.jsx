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
    MenuItem,
    Select,
    FormControl
} from "@mui/material";
import axiosInstance from "../../Config/axiosInstance";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { motion, AnimatePresence } from "framer-motion";

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
};

export default function LeaveReq({ open, handleClose, setSnackbar, getLeaveDashboard }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [employeeslist, setEmployeesList] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [formData, setFormData] = useState({
        employee: null,
        leaveType: null,
        fromDate: "",
        toDate: "",
        reason: "",
        shift: 1, // 1: Full day, 2: 1st half, 3: 2nd half
        leaveDocument: null,
    });

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({
                ...prev,
                leaveDocument: e.target.files[0],
            }));
        }
    };

    const getEmployees = async () => {
        try {
            setEmployeeLoading(true);
            const response = await axiosInstance.get("/hrm_web/employees/");
            if (response.data?.status) {
                setEmployeesList(response.data.data || []);
            } else {
                setEmployeesList([]);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            setEmployeesList([]);
        } finally {
            setEmployeeLoading(false);
        }
    };

    const getLeaveTypes = async (clg_id) => {
        try {
            const response = await axiosInstance.get(`/hrm_web/get_all_leavetypes/${clg_id}`);
            if (response.data?.status) {
                // const mappedLeaveTypes = response.data.data.map((item) => ({
                //     id: item.leave_type_id,
                //     code: item.leave_code,
                //     name: item.leave_name,
                // }));
                // console.log(mappedLeaveTypes, 'mappedLeaveTypes');
                console.log(response.data.data, 'data');
                setLeaveTypes(response.data.data);
            } else {
                setLeaveTypes([]);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
        }
    };

    useEffect(() => {
        if (open) {
            getEmployees();
            // getLeaveTypes();
        }
    }, [open]);

    const validate = () => {
        const temp = {};

        if (!formData.employee) {
            temp.employee = "Employee is required";
        }
        if (!formData.leaveType) {
            temp.leaveType = "Leave type is required";
        }
        if (!formData.fromDate) {
            temp.fromDate = "From date is required";
        }
        if (!formData.toDate) {
            temp.toDate = "To date is required";
        }
        if (!formData.reason.trim()) {
            temp.reason = "Reason for leave is required";
        }

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            // Using FormData to handle file attachments alongside payload values
            const submitData = new FormData();
            submitData.append("clg_id", formData.employee?.clg_id);
            submitData.append("LeaveTypeID", formData.leaveType);
            submitData.append("FromDate", formData.fromDate);
            submitData.append("ToDate", formData.toDate);
            submitData.append("Reason", formData.reason.trim());
            submitData.append("Shift", formData.shift);

            if (formData.leaveDocument) {
                submitData.append("leave_documents", formData.leaveDocument);
            }

            const response = await axiosInstance.post(
                "/hrm_web/apply_leave_web/",
                submitData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data) {
                setSnackbar({
                    open: true,
                    type: "success",
                    title: "Success",
                    message:
                        response.data?.message ||
                        "Leave request submitted successfully.",
                });
                getLeaveDashboard();
                // Reset state
                setFormData({
                    employee: null,
                    leaveType: 2,
                    fromDate: "",
                    toDate: "",
                    reason: "",
                    shift: 1,
                    leaveDocument: null,
                });
                setErrors({});
                handleClose();
            } else {
                setSnackbar({
                    open: true,
                    type: "error",
                    title: "Submission Failed",
                    message:
                        response.data?.message || "Unable to submit leave request.",
                });
            }
        } catch (error) {
            console.error("Error submitting leave request:", error);
            setSnackbar({
                open: true,
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Something went wrong while submitting the leave request.",
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
                            initial={{ opacity: 0, scale: 0.8, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 30 }}
                            transition={{ duration: 0.35 }}
                        >
                            <Box
                                sx={{
                                    width: {
                                        xs: "calc(100vw - 32px)",
                                        sm: 520,
                                    },
                                    maxHeight: "90vh",
                                    overflowY: "auto",
                                    bgcolor: "#fff",
                                    borderRadius: "18px",
                                    boxShadow: "0 25px 60px rgba(0,0,0,.18)",
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        px: 3,
                                        py: .5,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography sx={{ fontWeight: "500", fontSize: "1rem", color: '#0F1726' }}>
                                        New Leave Request
                                    </Typography>
                                    <IconButton onClick={handleClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                {/* Form */}
                                <Box sx={{ px: 3, pb: 3 }}>
                                    <Grid container spacing={1}>
                                        {/* Employee */}
                                        <Grid item xs={12} size={6}>
                                            <Typography fontWeight={600} fontSize={14} mb={0.8} color="#475569">
                                                Employee
                                            </Typography>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={employeeslist}
                                                loading={employeeLoading}
                                                value={formData.employee}
                                                onChange={(event, newValue) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        employee: newValue,
                                                    }));

                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        employee: "",
                                                    }));

                                                    // Call API when employee is selected
                                                    if (newValue?.clg_id) {
                                                        getLeaveTypes(newValue.clg_id);
                                                    }
                                                }}
                                                getOptionLabel={(option) =>
                                                    option?.employee_name || ""
                                                }
                                                isOptionEqualToValue={(option, value) =>
                                                    option?.clg_id === value?.clg_id
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select employee"
                                                        error={!!errors.employee}
                                                        helperText={errors.employee}
                                                        sx={textFieldStyle}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {/* Leave Type */}
                                        <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                fontSize={14}
                                                mb={0.8}
                                                color="#475569"
                                            >
                                                Leave Type
                                            </Typography>

                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={leaveTypes}
                                                value={
                                                    leaveTypes.find(
                                                        (item) =>
                                                            Number(item.leave_type_id) === Number(formData.leaveType)
                                                    ) || null
                                                }
                                                onChange={(event, newValue) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        leaveType: newValue?.leave_type_id || "",
                                                    }));

                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        leaveType: "",
                                                    }));
                                                }}
                                                getOptionLabel={(option) => {
                                                    return option?.leave_name
                                                        ? `${option.leave_name} (${option.leave_code})`
                                                        : "";
                                                }}
                                                isOptionEqualToValue={(option, value) =>
                                                    Number(option?.leave_type_id) === Number(value?.leave_type_id)
                                                }
                                                renderOption={(props, option) => (
                                                    <Box
                                                        component="li"
                                                        {...props}
                                                        key={option.leave_type_id}
                                                    >
                                                        <Box>
                                                            <Typography
                                                                fontSize={14}
                                                                fontWeight={600}
                                                                color="#334155"
                                                            >
                                                                {option.leave_name}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Leave Type"
                                                        error={!!errors.leaveType}
                                                        helperText={errors.leaveType}
                                                        sx={textFieldStyle}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        {/* From Date */}
                                        <Grid item xs={6} size={6}>
                                            <Typography fontWeight={600} fontSize={14} mb={0.8} color="#475569">
                                                From
                                            </Typography>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="date"
                                                name="fromDate"
                                                value={formData.fromDate}
                                                onChange={handleChange}
                                                error={!!errors.fromDate}
                                                helperText={errors.fromDate}
                                                InputLabelProps={{ shrink: true }}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        {/* To Date */}
                                        <Grid item xs={6} size={6}>
                                            <Typography fontWeight={600} fontSize={14} mb={0.8} color="#475569">
                                                To
                                            </Typography>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="date"
                                                name="toDate"
                                                value={formData.toDate}
                                                onChange={handleChange}
                                                error={!!errors.toDate}
                                                helperText={errors.toDate}
                                                InputLabelProps={{ shrink: true }}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        {/* Reason */}
                                        <Grid item xs={12} size={12}>
                                            <Typography fontWeight={600} fontSize={14} mb={0.8} color="#475569">
                                                Reason
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                multiline
                                                minRows={1}
                                                name="reason"
                                                value={formData.reason}
                                                onChange={handleChange}
                                                placeholder="Enter reason for leave..."
                                                error={!!errors.reason}
                                                helperText={errors.reason}
                                                sx={{
                                                    ...textFieldStyle,
                                                    "& .MuiOutlinedInput-root": {
                                                        ...textFieldStyle["& .MuiOutlinedInput-root"],
                                                        height: "auto",
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        {/* Supporting Document */}
                                        <Grid item xs={12} size={12}>
                                            <Typography fontWeight={600} fontSize={14} mb={0.8} color="#475569">
                                                Supporting Document
                                            </Typography>
                                            <Button
                                                component="label"
                                                fullWidth
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    border: "1px dashed #D0D5DD",
                                                    borderRadius: "12px",
                                                    textTransform: "none",
                                                    color: "#98A2B3",
                                                    bgcolor: "#FAFAFA",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    gap: 1,
                                                    "&:hover": {
                                                        borderColor: "#0B3029",
                                                        bgcolor: "#FFF",
                                                    },
                                                }}
                                            >
                                                <AttachFileIcon fontSize="small" sx={{ transform: "rotate(45deg)" }} />
                                                <Typography fontSize={13} color="#98A2B3">
                                                    {formData.leaveDocument
                                                        ? formData.leaveDocument.name
                                                        : "Drag & drop or click to upload"}
                                                </Typography>
                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={handleFileChange}
                                                />
                                            </Button>
                                        </Grid>
                                    </Grid>

                                    {/* Footer Actions */}
                                    <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleClose}
                                            sx={{
                                                height: 44,
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                borderColor: "#E5E7EB",
                                                color: "#344054",
                                                fontWeight: 600,
                                                "&:hover": {
                                                    borderColor: "#D0D5DD",
                                                    backgroundColor: "#F9FAFB",
                                                },
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
                                                height: 44,
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                fontWeight: 600,
                                                backgroundColor: "#E52535",
                                                "&:hover": {
                                                    backgroundColor: "#C9182A",
                                                },
                                            }}
                                        >
                                            {loading ? "Submitting..." : "Submit Request"}
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