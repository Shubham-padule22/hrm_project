import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  IconButton,
} from "@mui/material";

import axiosInstance from "../../Config/axiosInstance";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    height: 48,
    background: "#fff",
    "& fieldset": {
      borderColor: "#E5E7EB",
      borderWidth: "1px",
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
    color: "#9CA3AF",
    opacity: 1,
    fontSize: "15px",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    fontSize: "12px",
  },
};

export default function AddDepartmentModal({
  open,
  handleClose,
  fetchDepartments,
  editData,
}) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. roleCode mein default value 'UG-' set kar di
  const [formData, setFormData] = useState({
    roleName: "",
    roleCode: "UG-",
  });

  useEffect(() => {
    if (editData) {
      // Edit ke time check karenge ki prefix hai ya nahi, nahi toh laga denge
      let currentCode = editData.code || "";
      if (!currentCode.startsWith("UG-")) {
        currentCode = "UG-" + currentCode;
      }
      setFormData({
        roleName: editData.name || "",
        roleCode: currentCode,
      });
    } else {
      // Open hone par reset to 'UG-' (Add mode)
      setFormData({
        roleName: "",
        roleCode: "UG-",
      });
    }
    setErrors({});
  }, [editData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 2. Agar user roleCode change kar raha hai, toh check karein ki 'UG-' delete na ho
    if (name === "roleCode") {
      // Agar user 'UG-' ko delete karne ki koshish kare, toh return kar do (change apply mat karo)
      if (!value.startsWith("UG-")) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    let temp = {};
    if (!formData.roleName.trim()) {
      temp.roleName = "Department Name is required";
    }
    // Check if user only left "UG-" and didn't type anything else
    if (formData.roleCode.trim() === "UG-") {
      temp.roleCode = "Department Code is required";
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      organization: "1",
      department_name: formData.roleName,
      department_code: formData.roleCode, // 3. Ab direct bhej sakte hain kyunki 'UG-' already state me add hai
      department_head: "", // Sending empty string as it's removed from UI
      status: 1,
      is_deleted: 0,
    };

    try {
      const isEdit = Boolean(editData && editData.id);

      const apiUrl = isEdit
        ? `/hrm_web/department_put/${editData.id}/`
        : `/hrm_web/department_post/`;

      const response = await axiosInstance({
        method: isEdit ? "PUT" : "POST",
        url: apiUrl,
        data: payload,
      });

      if (response.status === 200 || response.status === 201) {
        console.log(isEdit ? "Role Updated!" : "Role Created!");
        if (typeof fetchDepartments === "function") {
          fetchDepartments();
        }
        handleClose();
      }
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        alert(
          `Failed to save: ${error.response.data.message || "Server Error"}`,
        );
      } else {
        alert("Network error! Please check your connection.");
      }
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
              p: 2,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: 500 },
                  bgcolor: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,.15)",
                }}
              >
                {/* --- Header --- */}
                <Box
                  sx={{
                    px: 3.5,
                    py: 2.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <Typography fontWeight={700} fontSize={18} color="#111827">
                    {editData ? "Edit Department" : "Add Department"}
                  </Typography>

                  <IconButton
                    onClick={handleClose}
                    sx={{ color: "#9CA3AF", p: 0.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                {/* --- Form --- */}
                <Box sx={{ p: 3.5 }}>
                  <Grid container spacing={3}>
                    {/* Role Name */}
                    <Grid item xs={12}>
                      <Typography
                        fontWeight={600}
                        mb={1}
                        fontSize={14}
                        color="#4B5563"
                      >
                        Department Name
                        <span style={{ color: "#EF4444" }}> *</span>
                      </Typography>

                      <TextField
                        fullWidth
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleChange}
                        placeholder="e.g. Clinical Support"
                        error={!!errors.roleName}
                        helperText={errors.roleName}
                        sx={textFieldStyle}
                      />
                    </Grid>

                    {/* Role Code */}
                    <Grid item xs={12}>
                      <Typography
                        fontWeight={600}
                        mb={1}
                        fontSize={14}
                        color="#4B5563"
                      >
                        Department Code
                        <span style={{ color: "#EF4444" }}> *</span>
                      </Typography>

                      <TextField
                        fullWidth
                        name="roleCode"
                        value={formData.roleCode}
                        onChange={handleChange}
                        placeholder="UG-2345"
                        error={!!errors.roleCode}
                        helperText={errors.roleCode}
                        sx={textFieldStyle}
                      />
                    </Grid>
                  </Grid>

                  {/* --- Footer Buttons --- */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 4.5,
                    }}
                  >
                    {/* Create Role Button (Left) */}
                    <Button
                      fullWidth
                      onClick={handleSubmit}
                      disabled={loading}
                      variant="contained"
                      sx={{
                        height: 48,
                        borderRadius: "24px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "14px",
                        background: "#E63946",
                        boxShadow: "0 8px 16px rgba(230, 57, 70, 0.25)",
                        "&:hover": {
                          background: "#D62828",
                          boxShadow: "0 10px 20px rgba(230, 57, 70, 0.35)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      {loading
                        ? "Saving..."
                        : editData
                          ? "Update Role"
                          : "Create Role"}
                    </Button>

                    {/* Cancel Button (Right) */}
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleClose}
                      sx={{
                        height: 48,
                        borderRadius: "24px",
                        textTransform: "none",
                        borderColor: "#E5E7EB",
                        color: "#6B7280",
                        fontWeight: 600,
                        fontSize: "14px",
                        "&:hover": {
                          backgroundColor: "#F9FAFB",
                          borderColor: "#D1D5DB",
                          color: "#374151",
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
