import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import axiosInstance from "../../Config/axiosInstance";
import PremiumSnackbar from "../common/PremiumSnackbar";

const Permission = () => {
  // --- Data States ---
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [moduleSubmodule, setModuleSubmodule] = useState([]);

  // --- Selection States ---
  const [sourceId, setSourceId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [permissionId, setPermissionId] = useState("");

  // --- Checkbox States ---
  const [moduleCheckboxes, setModuleCheckboxes] = useState({});
  const [submoduleCheckboxes, setSubmoduleCheckboxes] = useState({});
  const [actionCheckboxes, setActionCheckboxes] = useState({});
  const [allPermissionChecked, setAllPermissionChecked] = useState(false);

  // --- UI & TOAST STATES ---
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // 1. Initial Data Fetch (Departments & Combined Modules)
  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get(`/hrm_web/department_get/`);
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  const fetchCombinedModules = async () => {
    try {
      const response = await axiosInstance.get(`/hrm_web/combined/`);
      setModuleSubmodule(response.data);
    } catch (error) {
      console.error("Failed to fetch combined modules", error);
    }
  };

  // 2. Fetch Groups when Department is selected
  const handleDepartmentChange = async (e) => {
    const depId = e.target.value;
    setSourceId(depId);
    setRoleId("");
    setGroups([]);
    resetCheckboxes();

    try {
      const response = await axiosInstance.get(
        `/hrm_web/DepartmentwiseGroupGet/${depId}/`,
      );
      setGroups(response.data.data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  // 3. Fetch specific permissions when Role is selected
  const handleGroupChange = async (e) => {
    const role = e.target.value;
    setRoleId(role);
    resetCheckboxes();

    try {
      const response = await axiosInstance.get(
        `/hrm_web/permissions/${sourceId}/${role}/`,
      );
      const data = response.data;

      if (!data || data.length === 0) {
        setPermissionId("");
        return;
      }

      setPermissionId(data[0].id || data[0]._id);

      const moduleCheck = {};
      const submoduleCheck = {};
      const actionCheck = {};

      const permissions = data[0].modules_submodule || [];

      permissions.forEach((mod) => {
        moduleCheck[mod.moduleId] = true;
        mod.selectedSubmodules?.forEach((sub) => {
          submoduleCheck[sub.submoduleId] = true;
          sub.selectedActions?.forEach((act) => {
            actionCheck[act.actionId] = true;
          });
        });
      });

      setModuleCheckboxes(moduleCheck);
      setSubmoduleCheckboxes(submoduleCheck);
      setActionCheckboxes(actionCheck);
    } catch (error) {
      console.error("Failed to fetch role permissions", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCombinedModules();
  }, []);

  const resetCheckboxes = () => {
    setModuleCheckboxes({});
    setSubmoduleCheckboxes({});
    setActionCheckboxes({});
    setAllPermissionChecked(false);
    setPermissionId("");
  };

  // --- Checkbox Cascade Logic ---
  const handleAllPermissionChange = (e) => {
    const checked = e.target.checked;
    setAllPermissionChecked(checked);

    const updatedModules = {};
    const updatedSubmodules = {};
    const updatedActions = {};

    moduleSubmodule.forEach((module) => {
      updatedModules[module.module_id] = checked;
      module.submodules?.forEach((sub) => {
        updatedSubmodules[sub.Permission_id] = checked;
      });
      module.actions?.forEach((action) => {
        updatedActions[action.action_id] = checked;
      });
    });

    setModuleCheckboxes(updatedModules);
    setSubmoduleCheckboxes(updatedSubmodules);
    setActionCheckboxes(updatedActions);
  };

  const handleModuleChange = (moduleId, checked) => {
    setModuleCheckboxes((prev) => ({ ...prev, [moduleId]: checked }));
    const module = moduleSubmodule.find((mod) => mod.module_id === moduleId);

    if (module) {
      const updatedSub = { ...submoduleCheckboxes };
      const updatedActions = { ...actionCheckboxes };

      module.submodules?.forEach((sub) => {
        updatedSub[sub.Permission_id] = checked;
      });
      module.actions?.forEach((action) => {
        updatedActions[action.action_id] = checked;
      });

      setSubmoduleCheckboxes(updatedSub);
      setActionCheckboxes(updatedActions);
    }
  };

  const handleSubmoduleChange = (subId, checked, moduleId) => {
    setSubmoduleCheckboxes((prev) => ({ ...prev, [subId]: checked }));
    if (checked) {
      setModuleCheckboxes((prev) => ({ ...prev, [moduleId]: true }));
    }
  };

  const handleActionChange = (actionId, checked, subId, moduleId) => {
    setActionCheckboxes((prev) => ({ ...prev, [actionId]: checked }));
    if (checked) {
      setSubmoduleCheckboxes((prev) => ({ ...prev, [subId]: true }));
      setModuleCheckboxes((prev) => ({ ...prev, [moduleId]: true }));
    }
  };

  // --- Submit Logic (POST vs PUT) ---
  const handleSubmit = async () => {
    if (!sourceId || !roleId) {
      alert("Please select both Department and User Group.");
      return;
    }

    setLoading(true);

    const finalModulesArray = [];

    // 🔥 FILTERING LOGIC: Sirf checked items ko payload mein add karenge 🔥
    moduleSubmodule.forEach((module) => {
      // 1. Agar MODULE checked hai, tabhi usko process karo
      if (moduleCheckboxes[module.module_id]) {
        const selectedSub = [];

        // 2. Us module ke SUBMODULES loop karo
        (module.submodules || []).forEach((sub) => {
          // Agar SUBMODULE checked hai, tabhi usko process karo
          if (submoduleCheckboxes[sub.Permission_id]) {
            // 3. Us submodule ke ACTIONS filter karo jo checked hain
            const selectedActions = (module.actions || [])
              .filter(
                (a) =>
                  a.sub_module === sub.Permission_id &&
                  actionCheckboxes[a.action_id],
              )
              .map((a) => ({
                actionId: a.action_id,
                actionName: a.name,
              }));

            // Submodule ko array mein push karo (checked actions ke sath)
            selectedSub.push({
              submoduleId: sub.Permission_id,
              submoduleName: sub.name,
              selectedActions: selectedActions,
            });
          }
        });

        // Module ko array mein push karo (checked submodules ke sath)
        finalModulesArray.push({
          moduleId: module.module_id,
          moduleName: module.name,
          selectedSubmodules: selectedSub,
        });
      }
    });

    const payload = {
      source: sourceId,
      role: roleId,
      modules_submodule: finalModulesArray, // Checked data wala array bhej diya
    };

    try {
      if (permissionId) {
        payload.id = permissionId;
        await axiosInstance.put(
          `/hrm_web/permissions/${permissionId}/`,
          payload,
        );
      } else {
        await axiosInstance.post(`/hrm_web/permissions/`, payload);
      }

      setToast({
        open: true,
        type: "success",
        title: "Saved Successfully",
        message: "Your role permissions have been updated.",
      });

      resetCheckboxes();
      setSourceId("");
      setRoleId("");
    } catch (error) {
      console.error("Error saving permissions", error);
      setToast({
        open: true,
        type: "error",
        title: "Action Failed",
        message: "Something went wrong while saving permissions.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Framer Motion Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
    },
  };

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="show"
      variants={containerVariants}
      sx={{
        backgroundColor: "#F8FAFC",
        minHeight: "100vh",
        p: { xs: 2, md: 3, lg: 4 },
        fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <PremiumSnackbar
        open={toast.open}
        setOpen={(isOpen) => setToast({ ...toast, open: isOpen })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

      {/* --- Page Title --- */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          width: "100%",
          mb: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#0F172A",
            fontWeight: 700,
            fontSize: { xs: "20px", md: "1.3rem" },
            letterSpacing: "-0.5px",
          }}
        >
          Role & Permissions Management
        </Typography>
      </Box>

      {/* --- Filter Section --- */}
      <Paper
        component={motion.div}
        variants={itemVariants}
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          mb: 1,
          borderRadius: "16px",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          alignItems="flex-end"
        >
          {/* 1. Department */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#475569",
                  mb: 1,
                  ml: 0.5,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Department
              </Typography>

              <FormControl fullWidth>
                <Select
                  value={sourceId}
                  displayEmpty
                  onChange={handleDepartmentChange}
                  sx={{
                    height: "52px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1E293B",
                    backgroundColor: "#F8FAFC",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "1px solid #E2E8F0",
                    },
                    "&:hover": {
                      backgroundColor: "#FFFFFF",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CBD5E1",
                      },
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#FFFFFF",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "2px solid #0EA5E9",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled sx={{ display: "none" }}>
                    Select Department
                  </MenuItem>
                  {departments.map((dep) => (
                    <MenuItem
                      key={dep.pk_id}
                      value={dep.pk_id}
                      sx={{
                        fontSize: "14px",
                        py: 1.2,
                        borderRadius: "8px",
                        mx: 0.5,
                        "&:hover": { backgroundColor: "#F0F9FF" },
                      }}
                    >
                      {dep.department_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* 2. Role */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#475569",
                  mb: 1,
                  ml: 0.5,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                User Group / Role
              </Typography>

              <FormControl fullWidth disabled={!sourceId}>
                <Select
                  value={roleId}
                  displayEmpty
                  onChange={handleGroupChange}
                  sx={{
                    height: "52px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1E293B",
                    backgroundColor: !sourceId ? "#F1F5F9" : "#F8FAFC",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "1px solid #E2E8F0",
                    },
                    "&:hover": {
                      backgroundColor: "#FFFFFF",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CBD5E1",
                      },
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#FFFFFF",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "2px solid #0EA5E9",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled sx={{ display: "none" }}>
                    Select Role
                  </MenuItem>
                  {groups.map((grp) => (
                    <MenuItem
                      key={grp.gid}
                      value={grp.gid}
                      sx={{
                        fontSize: "14px",
                        py: 1.2,
                        borderRadius: "8px",
                        mx: 0.5,
                        "&:hover": { backgroundColor: "#F0F9FF" },
                      }}
                    >
                      {grp.ugname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* 3. Grant All Access Card */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {/* Invisible placeholder to align flexbox evenly without layout hacks */}
              <Typography
                sx={{
                  fontSize: "11px",
                  mb: 1,
                  color: "transparent",
                  userSelect: "none",
                }}
              >
                Quick Action
              </Typography>

              <Box
                onClick={() =>
                  handleAllPermissionChange({
                    target: { checked: !allPermissionChecked },
                  })
                }
                sx={{
                  height: "52px",
                  width: "100%",
                  px: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: allPermissionChecked
                    ? "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)"
                    : "#F8FAFC",
                  border: allPermissionChecked
                    ? "1px solid #BAE6FD"
                    : "1px solid #E2E8F0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#7DD3FC",
                    backgroundColor: "#F0F9FF",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.08)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: allPermissionChecked
                        ? "#E0F2FE"
                        : "#E2E8F0",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <Checkbox
                      checked={allPermissionChecked}
                      disableRipple
                      sx={{
                        p: 0,
                        color: "#94A3B8",
                        "&.Mui-checked": { color: "#0EA5E9" },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: allPermissionChecked ? "#0369A1" : "#334155",
                        lineHeight: 1.2,
                      }}
                    >
                      Grant All Access
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        mt: 0.2,
                      }}
                    >
                      Enable all permissions
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: allPermissionChecked
                      ? "#0EA5E9"
                      : "#CBD5E1",
                    boxShadow: allPermissionChecked
                      ? "0 0 0 4px rgba(14,165,233,0.10)"
                      : "none",
                    transition: "all 0.25s ease",
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* --- Permission Table --- */}
      <TableContainer
        component={motion.div}
        variants={itemVariants}
        elevation={0}
        sx={{
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
          mb: 1,
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ background: "#F8FAFC" }}>
              <TableCell
                sx={{
                  width: "25%",
                  color: "#475569",
                  fontWeight: 800,
                  fontSize: "11px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #E2E8F0",
                  py: 2,
                  px: 3,
                }}
              >
                Module
              </TableCell>
              <TableCell
                sx={{
                  width: "35%",
                  color: "#475569",
                  fontWeight: 800,
                  fontSize: "11px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #E2E8F0",
                  py: 2,
                  px: 3,
                }}
              >
                Submodules
              </TableCell>
              <TableCell
                sx={{
                  width: "40%",
                  color: "#475569",
                  fontWeight: 800,
                  fontSize: "11px",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #E2E8F0",
                  py: 2,
                  px: 3,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {moduleSubmodule.map((module) => (
              <TableRow
                key={module.module_id}
                sx={{
                  "&:hover": { backgroundColor: "#F8FAFC" },
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                {/* 1. MODULE */}
                <TableCell
                  sx={{
                    borderBottom: "1px dashed #E2E8F0",
                    py: 3,
                    px: 3,
                    verticalAlign: "top",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Checkbox
                      checked={moduleCheckboxes[module.module_id] || false}
                      onChange={(e) =>
                        handleModuleChange(module.module_id, e.target.checked)
                      }
                      sx={{
                        p: 0,
                        color: "#CBD5E1",
                        "&.Mui-checked": { color: "#0EA5E9" },
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#1E293B",
                          textTransform: "capitalize",
                        }}
                      >
                        {module.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* 2. SUBMODULES */}
              <TableCell
                  sx={{
                    borderBottom: "1px dashed #E2E8F0",
                    py: 3,
                    px: 3,
                    verticalAlign: "top",
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {module.submodules?.map((sub) => {
                      const isChecked =
                        submoduleCheckboxes[sub.Permission_id] || false;
                      return (
                        <Box
                          key={sub.Permission_id}
                          onClick={() =>
                            handleSubmoduleChange(
                              sub.Permission_id,
                              !isChecked,
                              module.module_id,
                            )
                          }
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 1.5,
                            py: 1,
                            m: 0.5,
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: isChecked
                              ? "rgba(14, 165, 233, 0.1)"
                              : "#F1F5F9",
                            color: isChecked ? "#0284C7" : "#475569",
                            border: `1px solid ${
                              isChecked
                                ? "rgba(14, 165, 233, 0.3)"
                                : "transparent"
                            }`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: isChecked
                                ? "rgba(14, 165, 233, 0.15)"
                                : "#E2E8F0",
                            },
                          }}
                        >
                          {sub.name}
                        </Box>
                      );
                    })}
                  </Box>
                </TableCell>

                {/* 3. ACTIONS (Fixed: Kept only one Actions cell) */}
                <TableCell
                  sx={{
                    borderBottom: "1px dashed #E2E8F0",
                    py: 3,
                    px: 3,
                    verticalAlign: "top",
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {module.actions?.map((action) => {
                      const isChecked =
                        actionCheckboxes[action.action_id] || false;
                      return (
                        <Box
                          key={action.action_id}
                          onClick={() =>
                            handleActionChange(
                              action.action_id,
                              !isChecked,
                              action.sub_module,
                              module.module_id,
                            )
                          }
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: 1.5,
                            py: 1,
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor: isChecked
                              ? "rgba(21, 128, 61, 0.1)"
                              : "#F1F5F9",
                            color: isChecked ? "#15803D" : "#64748B",
                            border: `1px solid ${
                              isChecked
                                ? "rgba(21, 128, 61, 0.3)"
                                : "transparent"
                            }`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: isChecked
                                ? "rgba(21, 128, 61, 0.15)"
                                : "#E2E8F0",
                            },
                          }}
                        >
                          {action.name}
                        </Box>
                      );
                    })}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- Action Button Floating Footer --- */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          position: "sticky",
          bottom: 16,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "16px",
          p: 2,
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          variant="contained"
          disabled={loading || !sourceId || !roleId}
          onClick={handleSubmit}
          sx={{
            px: 4,
            py: 1.2,
            minWidth: "200px",
            background:
              loading || !sourceId || !roleId
                ? "#E2E8F0"
                : "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
            color: loading || !sourceId || !roleId ? "#94A3B8" : "#FFFFFF",
            fontSize: "15px",
            fontWeight: 700,
            borderRadius: "10px",
            textTransform: "none",
            boxShadow:
              loading || !sourceId || !roleId
                ? "none"
                : "0 8px 16px -4px rgba(37, 99, 235, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)",
              boxShadow: "0 10px 20px -4px rgba(37, 99, 235, 0.4)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
          ) : permissionId ? (
            "Update Permissions"
          ) : (
            "Save Permissions"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default Permission;