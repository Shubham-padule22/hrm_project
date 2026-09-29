import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Box,
  Typography,
  Container,
  Avatar,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { hasPermission } from "../common/permissionUtils";
import AddDepartmentModal from "./AddDepartmentModal";
import AddRoleModal from "./AddRoleModal";
import axiosInstance from "../../Config/axiosInstance";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";

const MotionCard = motion(Card);

export default function Departments() {
  const canAdd = hasPermission(
    "User Management",
    "Departments & Branches",
    "Add"
  );

  const canEdit = hasPermission(
    "User Management",
    "Departments & Branches",
    "Edit"
  );
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerType, setDrawerType] = useState("roles"); // 'roles' or 'employees'
  const [drawerRoles, setDrawerRoles] = useState([]);
  const [drawerEmployees, setDrawerEmployees] = useState([]);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const cardColors = [
    "#0C3328",
    "#7C3AED",
    "#F4A100",
    "#0891B2",
    "#2563EB",
    "#00B884",
    "#E52435",
    "#9333EA",
  ];

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("hrm_web/department_get/");
      const data = response.data;

      if (
        data?.message === "Departments fetched successfully" &&
        Array.isArray(data?.data)
      ) {
        const mappedData = data.data.map((dept, index) => ({
          id: dept.pk_id,
          name: dept.department_name || "Department",
          code: dept.department_code || "",
          headId: dept.department_head || "",
          head: dept.department_head ? `ID: ${dept.department_head}` : "N/A",
          letter: dept.department_name
            ? dept.department_name.charAt(0).toUpperCase()
            : "?",
          color: cardColors[index % cardColors.length],
          employees:
            dept.employees ?? dept.employee_count ?? dept.total_employees ?? 0,
          budget: dept.budget ?? dept.department_budget ?? "$0",
          roles: dept.roles ?? dept.group_count ?? dept.total_roles ?? 0,
        }));
        setDepartments(mappedData);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // --- Handlers ---
  const handleMenuOpen = (event, dept) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDepartment(dept);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDeptAdd = () => {
    setEditData(null);
    setOpenDeptModal(true);
  };

  const handleOpenDeptEdit = () => {
    setEditData(selectedDepartment);
    setOpenDeptModal(true);
    handleMenuClose();
  };

  const handleOpenRoleAdd = () => {
    setOpenRoleModal(true);
    handleMenuClose();
  };

  // --- DRAWER HANDLER: Roles ---
  const handleOpenRoleDrawer = async (deptId, deptName) => {
    setDrawerType("roles");
    setDrawerTitle(deptName);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setSearchTerm("");

    try {
      const res = await axiosInstance.get(
        `/hrm_web/DepartmentwiseGroupGet/${deptId}/`,
      );
      setDrawerRoles(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setDrawerRoles([]);
    } finally {
      setDrawerLoading(false);
    }
  };

  // --- DRAWER HANDLER: Employees ---
  const handleOpenEmployeeDrawer = async (deptId, deptName) => {
    setDrawerType("employees");
    setDrawerTitle(deptName);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setSearchTerm("");

    try {
      const res = await axiosInstance.get(
        `/hrm_web/DepartmentwiseColleagueGet/${deptId}/`,
      );
      setDrawerEmployees(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setDrawerEmployees([]);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Filters for Drawer Search
  const filteredRoles = drawerRoles.filter(
    (role) =>
      role.ugname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.gcode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredEmployees = drawerEmployees.filter((emp) => {
    const empName = emp.employee_name || "";
    const empId = emp.clg_code || "";
    return (
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getAvatarInitials = (name) => {
    if (!name) return "E";
    const cleanName = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "");
    return cleanName.substring(0, 2).toUpperCase();
  };

  // --- Framer Motion Variants for Drawer List ---
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <Box sx={{ bgcolor: "#F7F8FA", minHeight: "100vh", pt: 2, pb: 5 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 3, lg: 3 } }}>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CustomBreadcrumbs />
        </motion.div>

        {/* HEADER SECTION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Typography
              sx={{ fontWeight: 800, fontSize: "22px", color: "#111827" }}
            >
              Departments
            </Typography>
          </Box>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            {canAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: "19px !important" }} />}
                onClick={handleOpenDeptAdd}
                sx={{
                  height: "44px",
                  background: "#E63946",
                  borderRadius: "24px",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(230, 57, 70, 0.25)",
                  "&:hover": { background: "#D62828" },
                }}
              >
                Add Department
              </Button>
            )}
          </motion.div>
        </Box>

        {/* CONTENT AREA */}
        {loading ? (
          <Box
            sx={{
              width: "100%",
              minHeight: 250,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={30} sx={{ color: "#E63946" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: "20px",
            }}
          >
            <AnimatePresence>
              {departments.map((dept, index) => (
                <MotionCard
                  key={dept.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #EAECF0",
                    boxShadow: "0px 2px 4px rgba(16, 24, 40, 0.04)",
                    padding: "16px 20px",
                    "&:hover": {
                      boxShadow: "0px 8px 16px rgba(16, 24, 40, 0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: dept.color,
                          width: 36,
                          height: 36,
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {dept.letter}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            color: "#111827",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          {dept.name}
                        </Typography>
                        <Typography sx={{ color: "#6B7280", fontSize: "11px" }}>
                          Head: {dept.head}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, dept)}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  </Box>

                  {/* Card Stats */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "10px",
                      mt: "16px",
                    }}
                  >
                    {/* Clickable Employees Box with Tooltip */}
                    <Tooltip title="View Employees" arrow placement="top">
                      <Box
                        onClick={() =>
                          handleOpenEmployeeDrawer(dept.id, dept.name)
                        }
                        sx={{
                          height: "54px",
                          borderRadius: "12px",
                          bgcolor: "#ECFDF3",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                          "&:hover": { bgcolor: "#D1FADF" },
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#027A48",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          {dept.employees}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#667085",
                            fontSize: "10px",
                            fontWeight: 500,
                          }}
                        >
                          Employees
                        </Typography>
                      </Box>
                    </Tooltip>

                    {/* Budget Box */}
                    <Box
                      sx={{
                        height: "54px",
                        borderRadius: "12px",
                        bgcolor: "#EFF8FF",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#175CD3",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {'-'}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#667085",
                          fontSize: "10px",
                          fontWeight: 500,
                        }}
                      >
                        Budget
                      </Typography>
                    </Box>

                    {/* Clickable Roles Box with Tooltip */}
                    <Tooltip title="View Roles" arrow placement="top">
                      <Box
                        onClick={() => handleOpenRoleDrawer(dept.id, dept.name)}
                        sx={{
                          height: "54px",
                          borderRadius: "12px",
                          bgcolor: "#F8FAFC",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                          "&:hover": { bgcolor: "#F1F5F9" },
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#344054",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          {dept.roles}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#667085",
                            fontSize: "10px",
                            fontWeight: 500,
                          }}
                        >
                          Roles
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </MotionCard>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </Container>

      {/* THREE DOT MENU */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: "140px",
            borderRadius: "10px",
            border: "1px solid #EAECF0",
            boxShadow: "0px 10px 24px rgba(16,24,40,0.08)",
          },
        }}
      >
        {canEdit && (
          <MenuItem
            onClick={handleOpenDeptEdit}
            sx={{ fontSize: "13px", color: "#344054", gap: 1.5 }}
          >
            <EditIcon sx={{ fontSize: "16px", color: "#667085" }} /> Edit Dept
          </MenuItem>)}
        <MenuItem
          onClick={handleOpenRoleAdd}
          sx={{ fontSize: "13px", color: "#344054", gap: 1.5 }}
        >
          <GroupAddOutlinedIcon sx={{ fontSize: "16px", color: "#667085" }} />{" "}
          Add Role
        </MenuItem>
      </Menu>

      {/* MODALS */}
      <AddDepartmentModal
        open={openDeptModal}
        handleClose={() => setOpenDeptModal(false)}
        fetchDepartments={fetchDepartments}
        editData={editData}
      />
      <AddRoleModal
        open={openRoleModal}
        handleClose={() => setOpenRoleModal(false)}
        departmentId={selectedDepartment?.id}
        fetchDepartments={fetchDepartments}
      />

      {/* =========================================================
          SLIDING DRAWER (Handles both Roles and Employees)
      ========================================================= */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: 1300 }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            borderRadius: "24px 0 0 24px",
            bgcolor: "#FFFFFF",
            boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            p: 1,

          }}
        >
          {/* Drawer Header (Updated with Close Icon) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              // mb: 3.5,
            }}
          >
            <Typography fontSize={18} fontWeight={700} color="#111827">
              {drawerType === "roles" ? "Roles" : "Employees"} in {drawerTitle}
            </Typography>

            <IconButton
              onClick={() => setDrawerOpen(false)}
              size="small"
              sx={{
                color: "#6B7280",
                bgcolor: "#F3F4F6",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#E5E7EB",
                  color: "#111827",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Pill-shaped Search Bar */}
          <TextField
            fullWidth
            placeholder={
              drawerType === "roles"
                ? "Search Role Name"
                : "Search Employee Name"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              // mb: 4,
              "& .MuiOutlinedInput-root": {
                height: 46,
                borderRadius: "50px",
                bgcolor: "#F9FAFB",
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "1px solid #E5E7EB" },
              },
              "& input::placeholder": {
                color: "#9CA3AF",
                fontSize: "14px",
                opacity: 1,
              },
            }}
          />

          {/* List Headers */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 1,
              mb: .5,
              pb: 1,
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <Typography fontSize={12} fontWeight={600} color="#6B7280">
              {drawerType === "roles" ? "Role Name" : "Employee Name"}
            </Typography>
            <Typography fontSize={12} fontWeight={600} color="#6B7280">
              ID
            </Typography>
          </Box>

          {/* Animated List Content */}
          {drawerLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <CircularProgress size={28} sx={{ color: "#0C3328" }} />
            </Box>
          ) : (
            <Box
              component={motion.div}
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              <List sx={{ p: 0 }}>
                {drawerType === "roles" ? (
                  /* ROLES LIST */
                  filteredRoles.length > 0 ? (
                    filteredRoles.map((role, idx) => (
                      <motion.div key={idx} variants={itemVariants}>
                        <ListItem
                          sx={{
                            px: 1,
                            py: 1,
                            borderRadius: "12px",
                            transition: "background-color 0.2s",
                            "&:hover": { bgcolor: "#F9FAFB" },
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 52 }}>
                            <Avatar
                              sx={{
                                bgcolor: "#0C3328",
                                color: "#fff",
                                width: 38,
                                height: 38,
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {role.ugname
                                ? role.ugname.substring(0, 2).toUpperCase()
                                : "R"}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                fontSize={14}
                                fontWeight={700}
                                color="#111827"
                                sx={{ mb: 0.3 }}
                              >
                                {role.ugname}
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ fontSize: '.9rem', color: "#6B7280" }}>
                                Level: {role.glevel || "Primary"}
                              </Typography>
                            }
                          />
                          <Typography
                            sx={{
                              fontSize: '.9rem',
                              fontWeight: '500',
                              color: "#4B5563"
                            }}
                          >
                            {role.gcode}
                          </Typography>
                        </ListItem>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div variants={itemVariants}>
                      <Typography textAlign="center" color="#9CA3AF" mt={5}>
                        No roles found matching your search.
                      </Typography>
                    </motion.div>
                  )
                ) : /* EMPLOYEES LIST */
                  filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp, idx) => {
                      // Fetch fields based on API JSON
                      const empName = emp.employee_name || "Employee";
                      const empId = emp.clg_code || "-";
                      const groupName = emp.group_name || "N/A";
                      const avatarInitials = getAvatarInitials(empName);

                      return (
                        <motion.div key={idx} variants={itemVariants}>
                          <ListItem
                            sx={{
                              px: 1,
                              // py: 2,
                              borderRadius: "12px",
                              transition: "background-color 0.2s",
                              "&:hover": { bgcolor: "#F9FAFB" },
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 52 }}>
                              <Avatar
                                sx={{
                                  bgcolor: "#0C3328",
                                  color: "#fff",
                                  width: 38,
                                  height: 38,
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                {avatarInitials}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  fontSize={14}
                                  fontWeight={700}
                                  color="#111827"
                                  sx={{ mb: 0.3 }}
                                >
                                  {empName}
                                </Typography>
                              }
                              secondary={
                                <Typography sx={{ fontSize: '.9rem', color: "#6B7280" }}>
                                  Role: {groupName}
                                </Typography>
                              }
                            />
                            <Typography
                              fontSize={13}
                              fontWeight={500}
                              color="#4B5563"
                            >
                              {empId}
                            </Typography>
                          </ListItem>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div variants={itemVariants}>
                      <Typography textAlign="center" color="#9CA3AF" mt={5}>
                        No employees found matching your search.
                      </Typography>
                    </motion.div>
                  )}
              </List>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
