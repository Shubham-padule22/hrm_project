import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  Badge,
  Paper,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Imported SweetAlert2
import logo from "../../assets/logo.png";
import axiosInstance from "../../Config/axiosInstance";
import useIdleLogout from "../Login/useIdleLogout";

export default function Header() {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [shiftDisplay, setShiftDisplay] = useState(""); // <-- Shift ke liye naya state

  // --- User Data State ---
  const [userName, setUserName] = useState("User");
  const [BranchName, setBranchName] = useState("Branch");

  // --- Menu State ---
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    setMounted(true);

    // Fetch user name from Local Storage (Checking emp_name first, then combining first & last name)
    const empName = localStorage.getItem("emp_name");
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    const branchName = localStorage.getItem("branch_name");

    let fullName = empName || `${firstName || ""} ${lastName || ""}`.trim();

    if (fullName) {
      // Capitalize the first letter of each word
      const formattedName = fullName
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
      setUserName(formattedName);
    }

    if (branchName) {
      const formattedBranch = branchName
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
      setBranchName(formattedBranch);
    }

    // --- Shift Data Logic ---
    const sName = localStorage.getItem("shift_name");
    let sStart = localStorage.getItem("shift_start_time");
    let sEnd = localStorage.getItem("shift_end_time");

    if (sName || (sStart && sEnd)) {
      if (sStart && sStart.length >= 5) sStart = sStart.substring(0, 5); // "09:00:03" -> "09:00"
      if (sEnd && sEnd.length >= 5) sEnd = sEnd.substring(0, 5); // "11:00:03" -> "11:00"

      let displayStr = sName ? sName : "Shift";
      if (sStart && sEnd) {
        displayStr += ` ${sStart} - ${sEnd}`;
      }
      setShiftDisplay(displayStr);
    }
    // ------------------------

    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IE", {
          timeZone: "Europe/Dublin",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour24: true, // Set to false if you prefer 24-hour format
        }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDate = new Date()
    .toLocaleDateString("en-IE", {
      timeZone: "Europe/Dublin",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/,/g, ""); // e.g., "Mon 27 Jul 2026"

  // --- Handlers ---
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Logout API Call with SweetAlert
  const handleLogout = () => {
    handleCloseMenu(); // Close dropdown menu first

    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      background: "#fff",
      borderRadius: "12px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading state in SweetAlert while calling API
          Swal.fire({
            title: "Logging out...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const refreshToken = localStorage.getItem("refresh_token");
          const logId = localStorage.getItem("log_id");

          await axiosInstance.post("/hrm_web/logout/", {
            refresh_token: refreshToken,
            log_id: logId ? parseInt(logId) : null,
          });

          // Clear all auth data
          localStorage.clear();

          // Close loading alert and redirect
          Swal.close();
          navigate("/");
        } catch (error) {
          console.error("Logout Failed:", error);
          // Force logout if API fails
          localStorage.clear();
          Swal.close();
          navigate("/");
        }
      }
    });
  };
  useIdleLogout(handleLogout);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#fff",
        backdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(230, 235, 242, 0.7)",
        color: "#1e293b",
        transition: "all 0.3s ease",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: { xs: "64px", md: "60px" },
          px: { xs: 2, md: 1 },
          gap: 2,
        }}
      >
        {/* --- Brand / Logo --- */}
        <Box
          component={motion.div}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: 120,
              height: 58,
              borderRadius: "12px",
              objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 32,
              alignSelf: "center",
              borderColor: "#25252566",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: { xs: "none", sm: "block" },
            }}
          >
            Workforce
          </Typography>
        </Box>

        {/* --- Right Controls --- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5, md: 2 },
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {/* Shift Badge (Dynamic) */}
          {shiftDisplay && (
            <Box
              component={motion.div}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Chip
                icon={
                  <WorkOutlineRoundedIcon
                    sx={{ fontSize: "18px !important" }}
                  />
                }
                label={shiftDisplay}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  bgcolor: "rgba(37, 99, 235, 0.08)",
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  border: "1px solid rgba(37, 99, 235, 0.15)",
                  borderRadius: "10px",
                  "& .MuiChip-icon": { color: "#2563eb" },
                }}
              />
            </Box>
          )}

          {/* Clock Display */}
          <Paper
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              px: 1.75,
              py: 0.85,
              borderRadius: "12px",
              // bgcolor: "#f8fafc",
              // border: "1px solid #e2e8f0",
              minWidth: 150,
              justifyContent: "center",
            }}
          >
            {/* TIME ROW WITH ICON */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeRoundedIcon sx={{ color: "#059669", fontSize: 16 }} />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  // fontFamily: "monospace",
                  color: "#0C3328",
                  lineHeight: 1,
                }}
              >
                {mounted ? time : "--:--:--"}
              </Typography>
            </Box>

            {/* DATE ROW WITH ICON */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayRoundedIcon
                sx={{ color: "#059669", fontSize: 15 }}
              />
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "#5E5E5E",
                  lineHeight: 1,
                }}
              >
                {mounted ? currentDate : "--- -- --- ----"}
              </Typography>
            </Box>
          </Paper>

          {/* Notifications */}
          {/* <Tooltip title="Notifications" arrow>
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                width: 40,
                height: 40,
              }}
            >
              <Badge
                badgeContent={3}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 10,
                    height: 18,
                    minWidth: 18,
                  },
                }}
              >
                <NotificationsNoneRoundedIcon
                  sx={{ fontSize: 20, color: "#64748b" }}
                />
              </Badge>
            </IconButton>
          </Tooltip> */}

          {/* --- User Profile (Clickable Trigger) --- */}
          <Paper
            elevation={0}
            onClick={handleProfileClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 0.5,
              pl: 0.75,
              pr: 1.25,
              borderRadius: "14px",
              bgcolor: openMenu ? "#f1f5f9" : "#f8fafc",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#f1f5f9",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px -4px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                border: "2px solid #fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                bgcolor: "#0f172a", // Premium dark background for avatar
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {userName.charAt(0)}
            </Avatar>
            <Box sx={{ display: { xs: "block", md: "block" } }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  lineHeight: 1.2,
                  color: "#0f172a",
                }}
              >
                {userName}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {/* {BranchName} */}
                Admin
              </Typography>
            </Box>
            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 18,
                color: "#94a3b8",
                ml: -0.25,
                transform: openMenu ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </Paper>

          {/* --- Premium Profile Dropdown Menu --- */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            disableScrollLock
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                  borderRadius: "8px",
                  mx: 1,
                  my: 0.5,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#334155",
                  transition: "all 0.2s ease",
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <PersonOutlineRoundedIcon
                  sx={{ fontSize: 20, color: "#64748b" }}
                />
              </ListItemIcon>
              My Profile
            </MenuItem>

            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <SettingsRoundedIcon sx={{ fontSize: 20, color: "#64748b" }} />
              </ListItemIcon>
              Settings
            </MenuItem> */}

            {/* <Divider sx={{ my: 1, mx: 2 }} /> */}

            <MenuItem
              onClick={handleLogout}
              sx={{
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.08) !important",
                  color: "#ef4444 !important",
                  "& .MuiListItemIcon-root": {
                    color: "#ef4444",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ transition: "color 0.2s ease" }}>
                <LogoutRoundedIcon sx={{ fontSize: 20, color: "#ef4444" }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
