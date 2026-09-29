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
            borderColor: "#DC1F30",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#DC1F30",
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

export default function AddShift({ open, handleClose, setSnackbar, getShiftRoster, editRoster }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [employeeslist, setEmployeesList] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [shiftHrs, setShiftHrs] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [formData, setFormData] = useState({
        employee: [],
        workingHours: null,
        shift: null,
        fromDate: "",
        toDate: "",
        reason: "",
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

    const getShiftHrs = async () => {
        try {
            const response = await axiosInstance.get(
                "/hrm_web/employee_master/7/"
            );

            console.log("Shift Hours Response:", response.data);

            const shiftHours = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

            setShiftHrs(shiftHours);
        } catch (error) {
            console.error("Error fetching shift hours:", error);
            setShiftHrs([]);
        }
    };
    const getShifts = async () => {
        try {
            const response = await axiosInstance.get("/hrm_web/shift/");

            console.log("Shift API Response:", response.data);

            if (response.data?.status) {
                setShiftList(response.data.data || []);
            } else {
                setShiftList([]);
            }
        } catch (error) {
            console.error("Error fetching shifts:", error);
            setShiftList([]);
        }
    };
    useEffect(() => {
        if (open) {
            getEmployees();
            getShiftHrs();
            getShifts();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        if (editRoster) {
            setFormData({
                employee: employeeslist.filter(
                    (employee) => Number(employee.clg_id) === Number(editRoster.employee)
                ),
                workingHours: null,
                shift: editRoster.shift || "",
                fromDate: editRoster.roster_date || "",
                toDate: editRoster.roster_date || "",
                reason: editRoster.remarks || "",
            });
        } else {
            setFormData({
                employee: [],
                workingHours: null,
                shift: null,
                fromDate: "",
                toDate: "",
                reason: "",
            });
        }
        setErrors({});
    }, [open, editRoster, employeeslist]);

    const validate = () => {
        const temp = {};

        if (!formData.employee) {
            temp.employee = "Employee is required";
        }

        if (!formData.workingHours) {
            temp.workingHours = "Working hours are required";
        }

        if (!formData.shift) {
            temp.shift = "Shift is required";
        }

        if (!formData.fromDate) {
            temp.fromDate = "From date is required";
        }

        if (!formData.toDate) {
            temp.toDate = "To date is required";
        }

        if (
            formData.fromDate &&
            formData.toDate &&
            formData.fromDate > formData.toDate
        ) {
            temp.toDate = "To date must be after From date";
        }

        setErrors(temp);

        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async () => {
        // if (!validate()) return;

        try {
            setLoading(true);

            const startDate = new Date(formData.fromDate);
            const endDate = new Date(formData.toDate);

            // const payload = {
            //     start_date: formData.fromDate,
            //     end_date: formData.toDate,

            //     month: startDate.getMonth() + 1,
            //     year: startDate.getFullYear(),

            //     is_weekoff: 0,
            //     is_holiday: 0,

            //     remarks: formData.reason?.trim() || "",

            //     employee: formData.employee.map((emp) => Number(emp.clg_id)),
            //     shift: Number(formData.shift),

            //     organization: localStorage.getItem("organization_id") || 1,
            //     branch: localStorage.getItem("branch_id") || 1,
            // };


            let payload;

            if (editRoster) {
                payload = {
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    employee: formData.employee.map((emp) => Number(emp.clg_id)),
                    shift: Number(formData.shift),
                    organization: Number(localStorage.getItem("organization_id")) || '',
                    branch: Number(localStorage.getItem("branch_id")) || '',
                    remarks: "Updated shift roster",
                };
            } else {
                payload = {
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    month: new Date(formData.fromDate).getMonth() + 1,
                    year: new Date(formData.fromDate).getFullYear(),
                    is_weekoff: 0,
                    is_holiday: 0,
                    remarks: formData.reason?.trim() || "",
                    employee: formData.employee.map((emp) => Number(emp.clg_id)),
                    shift: Number(formData.shift),
                    organization: Number(localStorage.getItem("organization_id")) || '',
                    branch: Number(localStorage.getItem("branch_id")) || '',
                };
            }
            console.log("Shift Roster Payload:", payload);

            const response = editRoster
                ? await axiosInstance.put("/hrm_web/shift-roster/update/", payload)
                : await axiosInstance.post("/hrm_web/shift-roster/", payload);

            console.log("Shift Roster Response:", response.data);

            if (response.data) {
                await getShiftRoster();
                setSnackbar({
                    open: true,
                    type: "success",
                    title: "Success",
                    message:
                        response.data?.message ||
                            editRoster
                            ? "Shift updated successfully."
                            : "Shift assigned successfully.",
                });
                // await getShiftRoster();
                setFormData({
                    employee: null,
                    workingHours: null,
                    shift: null,
                    fromDate: "",
                    toDate: "",
                    reason: "",
                });
                setErrors({});
                handleClose();
            } else {
                setSnackbar({
                    open: true,
                    type: "error",
                    title: "Submission Failed",
                    message:
                        response.data?.message ||
                        "Unable to assign shift.",
                });
            }
        } catch (error) {
            console.error("Error assigning shift:", error);

            setSnackbar({
                open: true,
                type: "error",
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Something went wrong while assigning shift.",
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
                                    <Typography sx={{ fontWeight: "500", fontSize: ".8rem", color: '#0F1726' }}>
                                        {editRoster ? "Update Shift Assignment" : "Add New Shift Assignment"}
                                    </Typography>
                                    <IconButton onClick={handleClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                {/* Form */}
                                <Box sx={{ px: 3, pb: 3 }}>
                                    <Grid container spacing={1}>
                                        {/* Employee */}
                                        <Grid item xs={12} size={12}>
                                            <Typography
                                                sx={{
                                                    fontSize: ".8rem",
                                                    fontWeight: 500,
                                                    color: "#4B5568",
                                                    mb: 0.8,
                                                }}
                                            >
                                                Employee
                                            </Typography>

                                            <Autocomplete
                                                multiple
                                                fullWidth
                                                disableClearable
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
                                                        placeholder={
                                                            formData?.employee?.length
                                                                ? ""
                                                                : "Select employee"
                                                        }
                                                        error={!!errors.employee}
                                                        helperText={errors.employee}
                                                        sx={textFieldStyle}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {/* working hrs */}
                                        <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                fontSize={14}
                                                mb={0.8}
                                                color="#475569"
                                            >
                                                Working Hours
                                            </Typography>

                                            <Autocomplete
                                                fullWidth
                                                disableClearable
                                                size="small"
                                                options={shiftHrs}
                                                value={
                                                    shiftHrs?.find(
                                                        (item) =>
                                                            Number(item.value) === Number(formData.workingHours)
                                                    ) || null
                                                }
                                                onChange={(event, newValue) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        workingHours: newValue?.value || "",
                                                    }));

                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        workingHours: "",
                                                    }));
                                                }}
                                                getOptionLabel={(option) =>
                                                    option?.label ? option.label : ""
                                                }
                                                isOptionEqualToValue={(option, value) =>
                                                    Number(option?.value) === Number(value?.value)
                                                }
                                                renderOption={(props, option) => (
                                                    <Box
                                                        component="li"
                                                        {...props}
                                                        key={option.value}
                                                    >
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight={600}
                                                            color="#334155"
                                                        >
                                                            {option.label}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Working Hours"
                                                        error={!!errors.workingHours}
                                                        helperText={errors.workingHours}
                                                        sx={textFieldStyle}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        {/* Shift Type */}
                                        <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                fontSize={14}
                                                mb={0.8}
                                                color="#475569"
                                            >
                                                Shift Type
                                            </Typography>

                                            <Autocomplete
                                                fullWidth
                                                disableClearable
                                                size="small"
                                                options={shiftList}
                                                value={
                                                    shiftList.find(
                                                        (item) =>
                                                            Number(item.shift_id) ===
                                                            Number(formData.shift)
                                                    ) || null
                                                }
                                                onChange={(event, newValue) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        shift: newValue?.shift_id || "",
                                                    }));

                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        shift: "",
                                                    }));
                                                }}
                                                getOptionLabel={(option) =>
                                                    option?.shift_name || ""
                                                }
                                                isOptionEqualToValue={(option, value) =>
                                                    Number(option?.shift_id) ===
                                                    Number(value?.shift_id)
                                                }
                                                renderOption={(props, option) => (
                                                    <Box
                                                        component="li"
                                                        {...props}
                                                        key={option.shift_id}
                                                    >
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight={600}
                                                            color="#334155"
                                                        >
                                                            {option.shift_name}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Shift"
                                                        error={!!errors.shift}
                                                        helperText={errors.shift}
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
                                    </Grid>

                                    {/* Footer Actions */}
                                    <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
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
                                            {loading ? "Submitting..." : editRoster ? "Update" : "Submit"}
                                        </Button>

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