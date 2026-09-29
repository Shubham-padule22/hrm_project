import { useState } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Grid,
    Button,
    IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        height: 48,
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
export default function PostNewJobModal({
    open,
    handleClose,
}) {
    const [formData, setFormData] = useState({
        departmentName: "",
        departmentCode: "",
        departmentHead: "",
        parentDepartment: "",
        annualBudget: "",
    });

    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove error while typing
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };
    const validate = () => {
        let temp = {};

        if (!formData.departmentName.trim()) {
            temp.departmentName = "Department Name is required";
        }

        if (!formData.departmentCode.trim()) {
            temp.departmentCode = "Department Code is required";
        }

        if (!formData.departmentHead.trim()) {
            temp.departmentHead = "Department Head is required";
        }

        setErrors(temp);

        return Object.keys(temp).length === 0;
    };
    const handleSubmit = () => {
        if (!validate()) return;

        console.log(formData);

        // API Call
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
                            p: 2,
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
                                duration: .35,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 640,
                                    bgcolor: "#fff",
                                    borderRadius: "18px",
                                    overflow: "hidden",
                                    boxShadow:
                                        "0 25px 60px rgba(0,0,0,.18)",
                                }}
                            >
                                {/* Header */}

                                <Box
                                    sx={{
                                        px: 3,
                                        py: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderBottom: "1px solid #ECECEC",
                                    }}
                                >
                                    <Typography
                                        fontWeight={700}
                                        fontSize={22}
                                    >
                                        Post New Job Opening
                                    </Typography>

                                    <IconButton onClick={handleClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                {/* Form */}

                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                              Job Title
                                                <span style={{ color: "red" }}>
                                                    {" "}
                                                    *
                                                </span>
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="departmentName"
                                                value={formData.departmentName}
                                                onChange={handleChange}
                                                placeholder="e.g. Clinical Support"
                                                error={!!errors.departmentName}
                                                helperText={errors.departmentName}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Department
                                                <span style={{ color: "red" }}>
                                                    {" "}
                                                    *
                                                </span>
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="departmentCode"
                                                value={formData.departmentCode}
                                                onChange={handleChange}
                                                placeholder="e.g. CLINSUP"
                                                error={!!errors.departmentCode}
                                                helperText={errors.departmentCode}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Employment Type
                                                <span style={{ color: "red" }}>
                                                    {" "}
                                                    *
                                                </span>
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="departmentHead"
                                                value={formData.departmentHead}
                                                onChange={handleChange}
                                                placeholder="Select employee"
                                                error={!!errors.departmentHead}
                                                helperText={errors.departmentHead}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Location
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="parentDepartment"
                                                value={formData.parentDepartment}
                                                onChange={handleChange}
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                        <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Salary Min
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="annualBudget"
                                                value={formData.annualBudget}
                                                onChange={handleChange}
                                                placeholder="$500,000"
                                                sx={textFieldStyle}
                                            />
                                        </Grid>

                                          <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Salary Max
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="annualBudget"
                                                value={formData.annualBudget}
                                                onChange={handleChange}
                                                placeholder="$500,000"
                                                sx={textFieldStyle}
                                            />
                                        </Grid>
                                          <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                               Application Deadline
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="annualBudget"
                                                value={''}
                                                onChange={handleChange}
                                                // placeholder="01-08-26"
                                                sx={textFieldStyle}
                                            />
                                        </Grid>
                                          <Grid item xs={12} size={6}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Priority
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="annualBudget"
                                                // value={formData.annualBudget}
                                                onChange={handleChange}
                                                // placeholder="$500,000"
                                                sx={textFieldStyle}
                                            />
                                        </Grid>
                                          <Grid item xs={12} size={12}>
                                            <Typography
                                                fontWeight={600}
                                                mb={1}
                                            >
                                                Job Description
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                name="annualBudget"
                                                // value={formData.annualBudget}
                                                onChange={handleChange}
                                                // placeholder="$500,000"
                                                sx={textFieldStyle}
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
                                                height: 50,
                                                borderRadius: "30px",
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
                                            sx={{
                                                height: 50,
                                                borderRadius: "30px",
                                                textTransform: "none",
                                                fontWeight: 700,
                                                background:
                                                    "linear-gradient(90deg,#DC1F30,#F04050)",

                                                boxShadow:
                                                    "0 10px 20px rgba(240,64,80,.35)",

                                                "&:hover": {
                                                    background:
                                                        "linear-gradient(90deg,#C9182A,#E62F42)",
                                                    transform: "translateY(-2px)",
                                                },
                                            }}
                                        >
                                            Post Job Opening
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