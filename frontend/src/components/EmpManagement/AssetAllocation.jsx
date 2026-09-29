import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import AddIcon from "@mui/icons-material/Add";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import LaptopMacOutlinedIcon from "@mui/icons-material/LaptopMacOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import RadioOutlinedIcon from "@mui/icons-material/RadioOutlined";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Delete from "@mui/icons-material/Delete";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined";
import KeyboardReturnOutlinedIcon from "@mui/icons-material/KeyboardReturnOutlined";

import { motion, AnimatePresence, animate } from "framer-motion";
import Swal from "sweetalert2";

import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import axiosInstance from "../../Config/axiosInstance";
import AssetAllocationModal from "./AssetAllocationModal";
import CustomPagination from "../common/Custompagination";
import { hasPermission } from "../common/permissionUtils";
import PremiumSnackbar from "../common/PremiumSnackbar";


const GRID_TEMPLATE_COLUMNS =
  "1.3fr 0.6fr 0.9fr 1.2fr 0.8fr 0.6fr 0.6fr 0.8fr 0.8fr 0.8fr 0.6fr";

const sidebarVariants = {
  hidden: { opacity: 0, x: -25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 220, damping: 20 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 7 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: index * 0.035, ease: "easeOut" },
  }),
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
};

const StatCard = ({ value, label, valueColor, background, icon }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node && value !== undefined) {
      const controls = animate(0, value, {
        duration: 1.2,
        ease: "easeOut",
        onUpdate(val) {
          node.textContent = Math.round(val);
        },
      });
      return () => controls.stop();
    }
  }, [value]);

  return (
    <Box
      component={motion.div}
      variants={cardVariants}
      whileHover={{ scale: 1.015 }}
      sx={{
        height: { xs: 76, sm: 84, md: 88 },
        borderRadius: "9px",
        background,
        px: { xs: 1.2, sm: 1.6 },
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 1,
        border: "1px solid rgba(0,0,0,0.03)",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: valueColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          ref={nodeRef}
          sx={{
            fontSize: { xs: 24, sm: 28 },
            lineHeight: 1,
            fontWeight: 700,
            color: valueColor,
          }}
        >
          0
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: "#27313C", mt: 0.6, fontWeight: 500 }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const TypeChip = ({ type }) => {
  const t = (type || "Other").toLowerCase();
  let style = { background: "#F1F4F7", color: "#59636E" };

  if (t.includes("laptop")) style = { background: "#EEF4FF", color: "#2878FF" };
  else if (t.includes("phone") || t.includes("mobile"))
    style = { background: "#EEF8F3", color: "#21855F" };
  else if (t.includes("uniform"))
    style = { background: "#F5EEFF", color: "#8A45E8" };
  else if (t.includes("vehicle"))
    style = { background: "#FFF5E8", color: "#F28A00" };
  else if (t.includes("radio"))
    style = { background: "#EAF9F6", color: "#0D9C83" };
  else if (t.includes("medical"))
    style = { background: "#FFF0F2", color: "#EF4B5F" };

  return (
    <Chip
      label={type || "Other"}
      size="small"
      sx={{
        height: 19,
        borderRadius: "5px",
        fontSize: 8.5,
        fontWeight: 600,
        textTransform: "capitalize",
        ...style,
        "& .MuiChip-label": { px: 0.8 },
      }}
    />
  );
};

const ConditionChip = ({ condition }) => {
  const c = (condition || "good").toLowerCase();
  let style = { background: "#E2F8F0", color: "#15956E" };

  if (c === "new") style = { background: "#E8F0FF", color: "#2878FF" };
  else if (c === "fair") style = { background: "#FFF3D8", color: "#E59A00" };
  else if (c === "damaged") style = { background: "#FFF0F0", color: "#EF3340" };
  else if (c === "on_hold") style = { background: "#F3F4F6", color: "#6B7280" };

  return (
    <Chip
      label={condition || "Good"}
      size="small"
      sx={{
        height: 19,
        borderRadius: "5px",
        fontSize: 8.2,
        fontWeight: 600,
        textTransform: "capitalize",
        ...style,
        "& .MuiChip-label": { px: 0.8 },
      }}
    />
  );
};

const StatusChip = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  let style = { background: "#F3F4F6", color: "#6B7280" };

  if (s === "active" || s === "verified" || s === "allocated") {
    style = { background: "#D1FAE5", color: "#047857" };
  } else if (s === "pending" || s === "on hold") {
    style = { background: "#FEF3C7", color: "#D97706" };
  } else if (s === "returned" || s === "rejected" || s === "deleted") {
    style = { background: "#FEE2E2", color: "#B91C1C" };
  }

  return (
    <Chip
      label={status || "N/A"}
      size="small"
      sx={{
        height: 19,
        borderRadius: "5px",
        fontSize: 7.5,
        fontWeight: 700,
        textTransform: "capitalize",
        ...style,
        "& .MuiChip-label": { px: 0.8 },
      }}
    />
  );
};

const AssetIcon = ({ type }) => {
  const t = (type || "").toLowerCase();
  const commonStyle = {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (t.includes("laptop"))
    return (
      <Box sx={{ ...commonStyle, background: "#EEF4FF", color: "#2878FF" }}>
        <LaptopMacOutlinedIcon sx={{ fontSize: 13 }} />
      </Box>
    );

  if (t.includes("phone") || t.includes("mobile"))
    return (
      <Box sx={{ ...commonStyle, background: "#EEF8F3", color: "#21855F" }}>
        <SmartphoneOutlinedIcon sx={{ fontSize: 13 }} />
      </Box>
    );

  if (t.includes("medical"))
    return (
      <Box sx={{ ...commonStyle, background: "#FFF0F2", color: "#EF4B5F" }}>
        <MedicalServicesOutlinedIcon sx={{ fontSize: 13 }} />
      </Box>
    );

  if (t.includes("vehicle"))
    return (
      <Box sx={{ ...commonStyle, background: "#FFF5E8", color: "#F28A00" }}>
        <DirectionsCarOutlinedIcon sx={{ fontSize: 13 }} />
      </Box>
    );

  if (t.includes("radio"))
    return (
      <Box sx={{ ...commonStyle, background: "#EAF9F6", color: "#0D9C83" }}>
        <RadioOutlinedIcon sx={{ fontSize: 13 }} />
      </Box>
    );

  return (
    <Box sx={{ ...commonStyle, background: "#F5EEFF", color: "#8A45E8" }}>
      <CheckroomOutlinedIcon sx={{ fontSize: 13 }} />
    </Box>
  );
};

const RowActionMenu = ({
  row,
  allocationId,
  openViewModal,
  openEditModal,
  handleStatusAction,
  handleDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onAction = (actionFn) => {
    actionFn();
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", px: 0.5 }}>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          width: 26,
          height: 26,
          background: open ? "#E2E8F0" : "transparent",
          color: "#64748B",
          transition: "all 0.2s ease",
          "&:hover": { background: "#F1F5F9", color: "#0F172A" },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.5,
            minWidth: 150,
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
            "& .MuiMenuItem-root": {
              fontSize: 11.5,
              fontWeight: 500,
              color: "#334155",
              py: 0.8,
              px: 1.5,
              gap: 1.2,
            },
          },
        }}
      >
        <MenuItem onClick={() => onAction(() => openViewModal(row))}>
          <ListItemIcon sx={{ minWidth: "auto !important" }}>
            <VisibilityOutlinedIcon sx={{ fontSize: 15, color: "#073F35" }} />
          </ListItemIcon>
          View Asset
        </MenuItem>

        <MenuItem onClick={() => onAction(() => openEditModal(row))}>
          <ListItemIcon sx={{ minWidth: "auto !important" }}>
            <EditOutlinedIcon sx={{ fontSize: 15, color: "#2878FF" }} />
          </ListItemIcon>
          Edit Asset
        </MenuItem>

        <MenuItem
          onClick={() =>
            onAction(() => handleStatusAction(allocationId, "verify"))
          }
        >
          <ListItemIcon sx={{ minWidth: "auto !important" }}>
            <VerifiedOutlinedIcon sx={{ fontSize: 15, color: "#15956E" }} />
          </ListItemIcon>
          Verify
        </MenuItem>

        <MenuItem
          onClick={() =>
            onAction(() => handleStatusAction(allocationId, "hold"))
          }
        >
          <ListItemIcon sx={{ minWidth: "auto !important" }}>
            <PanToolOutlinedIcon sx={{ fontSize: 15, color: "#F28A00" }} />
          </ListItemIcon>
          Put On Hold
        </MenuItem>

        <MenuItem
          onClick={() =>
            onAction(() => handleStatusAction(allocationId, "return"))
          }
        >
          <ListItemIcon sx={{ minWidth: "auto !important" }}>
            <KeyboardReturnOutlinedIcon
              sx={{ fontSize: 15, color: "#7435D5" }}
            />
          </ListItemIcon>
          Return Asset
        </MenuItem>

        <MenuItem
          onClick={() => onAction(() => handleDelete(allocationId))}
          sx={{
            color: "#EF3340 !important",
            "&:hover": { background: "#FEF2F2 !important" },
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto !important" }}>
            <Delete sx={{ fontSize: 15, color: "#EF3340" }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default function AssetAllocation() {
  const canIssueAsset = hasPermission(
    "Employees",
    "Asset-Allocation",
    "Issue-Asset"
  );

  const canCreateAsset = hasPermission(
    "Employees",
    "Asset-Allocation",
    "Create-Asset"
  );
  
  const [allocations, setAllocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeType, setActiveType] = useState("All");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const [serverCount, setServerCount] = useState(null);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalMode, setAssetModalMode] = useState("add"); // "add", "edit", "view"
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showSnackbar = (type, title, message) => {
    setSnackbar({ open: true, type, title, message });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      let url = `/hrm_web/asset-allocations/?page=${page}&page_size=${rowsPerPage}&`;
      if (debouncedSearch) {
        url += `search=${encodeURIComponent(debouncedSearch)}&`;
      }
      if (activeType !== "All") {
        const category =
          activeType === "Phone" ? "mobile" : activeType.toLowerCase();
        url += `asset__category=${category}&`;
      }

      const response = await axiosInstance.get(url);
      const payload = response.data;

      if (payload && Array.isArray(payload.results)) {
        setAllocations(payload.results);
        setServerCount(
          typeof payload.count === "number" ? payload.count : null
        );
      } else {
        setAllocations(Array.isArray(payload) ? payload : []);
        setServerCount(null);
      }
    } catch (error) {
      console.error("Failed to fetch allocations:", error);
      setAllocations([]);
      setServerCount(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(
        "/hrm_web/asset/category-count/"
      );
      if (response.data && response.data.status) {
        const counts = {};
        response.data.data.forEach((item) => {
          counts[item.category] = item.count;
        });
        setStats(counts);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchEmployeeOptions = async (term = "") => {
    try {
      const response = await axiosInstance.get(
        `/hrm_web/employee_registretion/?search=${encodeURIComponent(term)}`
      );
      const employees = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const mapped = employees.map((emp) => ({
        id: emp.clg_id,
        refId: emp.clg_ref_id,
        name: `${emp.clg_first_name || ""} ${emp.clg_last_name || ""}`.trim(),
        email: emp.clg_email || "",
      }));
      setEmployeeOptions(mapped);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployeeOptions([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEmployeeOptions();
  }, []);

  useEffect(() => {
    fetchAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeType, page]);

  const sortedAllocations = useMemo(() => {
    const data = [...allocations];
    data.sort((a, b) => {
      const nameA = a?.asset_name || a?.asset?.asset_name || "";
      const nameB = b?.asset_name || b?.asset?.asset_name || "";
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return data;
  }, [allocations, sortAsc]);

  const usingServerPagination = serverCount !== null;
  const totalItems = usingServerPagination
    ? serverCount
    : sortedAllocations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const paginatedAllocations = usingServerPagination
    ? sortedAllocations
    : sortedAllocations.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openAddModal = () => {
    setSelectedAllocation(null);
    setAssetModalMode("add");
    setAssetModalOpen(true);
  };

  const openViewModal = (row) => {
    setSelectedAllocation(row);
    setAssetModalMode("view");
    setAssetModalOpen(true);
  };

  const openEditModal = (row) => {
    setSelectedAllocation(row);
    setAssetModalMode("edit");
    setAssetModalOpen(true);
  };

  const closeAssetModal = () => {
    setAssetModalOpen(false);
    setSelectedAllocation(null);
  };

  const handleModalSuccess = async () => {
    setAssetModalOpen(false);
    setSelectedAllocation(null);
    showSnackbar("success", "Success", "Action completed successfully");
    await fetchAllocations();
    await fetchStats();
  };

  const handleStatusAction = async (id, action) => {
    const actionText =
      action === "verify"
        ? "verify"
        : action === "hold"
          ? "put on hold"
          : "return";

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${actionText} this asset?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#073F35",
      cancelButtonColor: "#EF3340",
      confirmButtonText: `Yes, ${actionText} it`,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axiosInstance.post(`/hrm_web/asset-allocations/${id}/${action}/`);
      
      showSnackbar(
        "success",
        "Success",
        `Asset ${action === "verify" ? "verified" : action === "hold" ? "put on hold" : "returned"} successfully!`
      );
      
      await fetchAllocations();
      await fetchStats();
    } catch (error) {
      showSnackbar("error", "Error", `Failed to ${actionText} asset.`);
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this allocation? This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF3340",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axiosInstance.delete(`/hrm_web/asset-allocations/${id}/`);
      showSnackbar("success", "Deleted", "Asset allocation deleted successfully.");
      await fetchAllocations();
      await fetchStats();
    } catch (error) {
      showSnackbar("error", "Error", "Failed to delete allocation.");
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      sx={{
        minHeight: "100vh",
        background: "#F5F7FA",
        color: "#1F2937",
        fontFamily: "Inter, Arial, sans-serif",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          minHeight: "calc(100vh - 45px)",
          px: { xs: 1, sm: 1.5, md: 1.5 },
          py: { xs: 0.7, sm: 0.9, md: 1 },
        }}
      >
        <CustomBreadcrumbs />

        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, md: 1.3 },
            alignItems: "stretch",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
          }}
        >
          <Box sx={{ width: { xs: "100%", md: 175, lg: 180 }, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid #E6E9ED",
                borderRadius: "9px",
                p: 1,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 0.5,
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: "#18202A",
                  }}
                >
                  Asset
                  <br />
                  Allocation
                </Typography>

                {canIssueAsset && (
                  <Button
                    variant="contained"
                    onClick={openAddModal}
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      borderRadius: "12px",
                      background:
                        "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
                      boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      px: 1.5,
                      py: 0.5,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        background:
                          "linear-gradient(225deg, #C81A2B 14.64%, #E53945 85.36%)",
                        boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                      },
                    }}
                  >
                    Issue Asset
                  </Button>
                )}
              </Box>

              <Box
                component={motion.div}
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
              >
                <StatCard
                  value={stats?.laptop || 0}
                  label="Laptop"
                  valueColor="#00986F"
                  background="#F0FDF4"
                  icon={<LaptopMacOutlinedIcon sx={{ fontSize: 24 }} />}
                />
                <StatCard
                  value={stats?.mobile || 0}
                  label="Phone"
                  valueColor="#0867E8"
                  background="#EFF6FF"
                  icon={<SmartphoneOutlinedIcon sx={{ fontSize: 24 }} />}
                />
                <StatCard
                  value={stats?.medical || 0}
                  label="Medical Kit"
                  valueColor="#F28A00"
                  background="#FFF7ED"
                  icon={<MedicalServicesOutlinedIcon sx={{ fontSize: 24 }} />}
                />
                <StatCard
                  value={stats?.uniform || 0}
                  label="Uniform"
                  valueColor="#7435D5"
                  background="#F5F3FF"
                  icon={<CheckroomOutlinedIcon sx={{ fontSize: 24 }} />}
                />
              </Box>
            </Paper>
          </Box>

          <Box
            component={motion.div}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            sx={{ flex: 1, minWidth: 0, width: "100%" }}
          >
            <Paper
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid #E6E9ED",
                borderRadius: "9px",
                p: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  width: "100%",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets, tag..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 14, color: "#A0A7B0" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      height: 30,
                      borderRadius: "7px",
                      fontSize: 9.5,
                      background: "#FAFBFC",
                      "& fieldset": { borderColor: "#E4E7EB" },
                      "&.Mui-focused fieldset": { borderColor: "#073F35" },
                    },
                    "& .MuiInputBase-input": { fontSize: 9.5 },
                  }}
                />
                <Button
                  onClick={() => setSortAsc((prev) => !prev)}
                  startIcon={<SortOutlinedIcon sx={{ fontSize: 10 }} />}
                  sx={{
                    minWidth: "auto",
                    height: 25,
                    px: 0.45,
                    fontSize: 7.5,
                    color: "#59636E",
                    textTransform: "none",
                  }}
                >
                  Sort
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.45,
                  mt: 0.8,
                  overflowX: "auto",
                }}
              >
                {[
                  "All",
                  "Laptop",
                  "Phone",
                  "Uniform",
                  "Vehicle",
                  "Radio",
                  "Medical",
                ].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    onClick={() => {
                      setActiveType(item);
                      setPage(1);
                    }}
                    sx={{
                      height: 19,
                      borderRadius: "5px",
                      fontSize: 9.5,
                      fontWeight: activeType === item ? 700 : 500,
                      background: activeType === item ? "#073F35" : "#F8FAFC",
                      color: activeType === item ? "#fff" : "#4B5563",
                      border:
                        activeType === item ? "none" : "1px solid #E6E9ED",
                      cursor: "pointer",
                      "&:hover": {
                        background: activeType === item ? "#073F35" : "#F0F2F4",
                      },
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                ))}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid #E6E9ED",
                borderRadius: "9px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
                  alignItems: "center",
                  minHeight: 38,
                  px: 1,
                  borderBottom: "1px solid #E8EBEF",
                  background: "#FCFDFE",
                  width: "100%",
                }}
              >
                {[
                  "ASSET",
                  "TYPE",
                  "SERIAL / ID",
                  "ASSIGNED TO",
                  "DEPARTMENT",
                  "CONDITION",
                  "BARCODE",
                  "ALLOC. STATUS",
                  "VERIF. STATUS",
                  "VERIFIED ON",
                  "ACTIONS",
                ].map((heading) => (
                  <Typography
                    key={heading}
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#66717D",
                      letterSpacing: ".15px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      px: 0.5,
                    }}
                  >
                    {heading}
                  </Typography>
                ))}
              </Box>

              <Box
                sx={{
                  minHeight: 270,
                  maxHeight: "calc(100vh - 280px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 250,
                    }}
                  >
                    <CircularProgress size={25} sx={{ color: "#073F35" }} />
                  </Box>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {paginatedAllocations.length > 0 ? (
                      paginatedAllocations.map((row, index) => {
                        const asset = row.asset || row;
                        const colleague = row.colleague || {};

                        const assetName =
                          row.asset_name || asset.asset_name || "Unknown";
                        const category = row.category || asset.category || "";
                        const serial =
                          row.serial_number ||
                          asset.serial_number ||
                          asset.asset_tag ||
                          row.asset_tag ||
                          "N/A";

                        const employeeName =
                          row.employee_name || colleague.name || "N/A";
                        const employeeInitials =
                          row.employee_avatar_initials ||
                          employeeName.charAt(0).toUpperCase();

                        const department =
                          row.department ||
                          colleague.department ||
                          colleague.department_name ||
                          "N/A";
                        const condition =
                          asset.condition || row.condition || "";
                        const barcode =
                          asset.barcode ||
                          row.barcode ||
                          asset.asset_tag ||
                          row.asset_tag ||
                          "N/A";

                        const allocationStatus =
                          row.allocation_status || "pending";
                        const verificationStatus =
                          row.verification_status || "pending";
                        const verifiedOnDate = row.verified_on
                          ? new Date(row.verified_on).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Not Verified";

                        const allocationId = row.allocation_id || row.id;

                        return (
                          <Box
                            key={allocationId || index}
                            component={motion.div}
                            layout
                            custom={index}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            sx={{
                              display: "grid",
                              gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
                              alignItems: "center",
                              minHeight: 45,
                              px: 1,
                              borderBottom: "1px solid #F0F2F4",
                              width: "100%",
                              transition: "background 0.2s",
                              "&:hover": { background: "#FAFCFB" },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                minWidth: 0,
                                px: 0.5,
                              }}
                            >
                              <AssetIcon type={category} />
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#27313C",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {assetName}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                px: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <TypeChip type={category} />
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                px: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 8,
                                  background: "#F1F4F7",
                                  borderRadius: "4px",
                                  px: 0.6,
                                  py: 0.3,
                                  color: "#59636E",
                                  fontWeight: 500,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {serial}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.6,
                                minWidth: 0,
                                px: 0.5,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 22,
                                  height: 22,
                                  fontSize: 7,
                                  fontWeight: 700,
                                  background: "#073F35",
                                  flexShrink: 0,
                                }}
                              >
                                {employeeInitials}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontSize: 9,
                                  color: "#344054",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {employeeName}
                              </Typography>
                            </Box>

                            <Box sx={{ minWidth: 0, px: 0.5 }}>
                              <Typography
                                sx={{
                                  fontSize: 8.8,
                                  color: "#4A5561",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {department}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                px: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <ConditionChip condition={condition} />
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                px: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 7.8,
                                  color: "#59636E",
                                  background: "#F7F8FA",
                                  borderRadius: "4px",
                                  px: 0.6,
                                  py: 0.3,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                ▥ {barcode}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                px: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <StatusChip status={allocationStatus} />
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                px: 0.5,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <StatusChip status={verificationStatus} />
                            </Box>

                            <Box sx={{ minWidth: 0, px: 0.5 }}>
                              <Typography
                                sx={{
                                  fontSize: 8.5,
                                  color: "#4A5561",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {verifiedOnDate}
                              </Typography>
                            </Box>

                            <RowActionMenu
                              row={row}
                              allocationId={allocationId}
                              openViewModal={openViewModal}
                              openEditModal={openEditModal}
                              handleStatusAction={handleStatusAction}
                              handleDelete={handleDelete}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Box sx={{ py: 8, textAlign: "center" }}>
                        <Typography sx={{ fontSize: 14, color: "#8A929B" }}>
                          No assets found
                        </Typography>
                      </Box>
                    )}
                  </AnimatePresence>
                )}
              </Box>

              {!loading && totalItems > 0 && (
                <CustomPagination
                  page={page}
                  totalItems={totalItems}
                  itemsPerPage={rowsPerPage}
                  onPageChange={(nextPage) => setPage(nextPage)}
                />
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      <AssetAllocationModal
        open={assetModalOpen}
        mode={assetModalMode}
        allocation={selectedAllocation}
        employeeOptions={employeeOptions}
        fetchEmployeeOptions={fetchEmployeeOptions}
        onClose={closeAssetModal}
        onSuccess={handleModalSuccess}
      />

      {/* Premium Snackbar Integrated Here */}
      <PremiumSnackbar
        open={snackbar.open}
        setOpen={(isOpen) => setSnackbar((prev) => ({ ...prev, open: isOpen }))}
        type={snackbar.type}
        title={snackbar.title}
        message={snackbar.message}
      />
    </Box>
  );
}