import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";

// SweetAlert2 (Swal)
import Swal from "sweetalert2";

// Framer Motion
import { motion, AnimatePresence } from "framer-motion";

// Components
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import CustomPagination from "../common/Custompagination";
import AddBankAccountModal from "./AddBankAccountModal";
import axiosInstance from "../../Config/axiosInstance";
import ViewBankAccountModal from "./Viewbankaccountmodal";

const TABLE_HEADER_FONT = {
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.35px",
  color: "#66717D",
  textTransform: "uppercase",
};

const TABLE_BODY_FONT = {
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "#374151",
};

const TABLE_BODY_FONT_STRONG = {
  ...TABLE_BODY_FONT,
  fontSize: 11,
  fontWeight: 700,
  color: "#27313C",
};

const TABLE_BODY_FONT_MUTED = {
  ...TABLE_BODY_FONT,
  fontSize: 8.5,
  fontWeight: 500,
  color: "#9AA1A9",
};

const tableGridColumns =
  "minmax(110px, 1.3fr) minmax(95px, 1.05fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(60px, 0.7fr) minmax(70px, 0.8fr) minmax(70px, 0.8fr) minmax(75px, 0.85fr) minmax(95px, 0.9fr)";

const PAGE_SIZE = 10;

const leftSidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const leftCardVariants = {
  hidden: { opacity: 0, x: -35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 240, damping: 20 },
  },
};

const rightContentVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 22, delay: 0.1 },
  },
};

const rowVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, delay: index * 0.03, ease: "easeOut" },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.12 } },
};

const StatCard = ({ icon, value, label, valueColor, background, border }) => (
  <Box
    component={motion.div}
    variants={leftCardVariants}
    whileHover={{ scale: 1.02 }}
    sx={{
      height: { xs: 76, sm: 84, md: 88 },
      borderRadius: "9px",
      background,
      px: { xs: 1.2, sm: 1.6 },
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      mb: 1,
      border: `1px solid ${border}`,
      cursor: "default",
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
        sx={{
          fontSize: { xs: 24, sm: 28 },
          lineHeight: 1,
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{ fontSize: 13, color: "#374151", mt: 0.6, fontWeight: 500 }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const PayStatusChip = ({ status }) => {
  const styles = {
    Active: { background: "#E4F8F1", color: "#15956E" },
    Pending: { background: "#FFF1CF", color: "#E59A00" },
    "On Hold": { background: "#EEF1F5", color: "#64748B" },
  };
  const style = styles[status] || styles.Pending;

  return (
    <Chip
      label={status || "Pending"}
      size="small"
      sx={{
        height: 20,
        borderRadius: "5px",
        fontFamily: TABLE_BODY_FONT.fontFamily,
        fontSize: 8.5,
        fontWeight: 600,
        backgroundColor: style.background,
        color: style.color,
        "& .MuiChip-label": { px: 0.9 },
      }}
    />
  );
};

export default function BankVerification() {
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [addBankModalOpen, setAddBankModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    on_hold: 0,
  });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const abortControllerRef = useRef(null);

  const fetchDashboardStats = async () => {
    try {
      const response = await axiosInstance.get(
        `hrm_web/employee_bank_accounts/dashboard/`,
      );
      const result = response.data;
      if (result.status && result.data) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  const fetchBankAccounts = async (targetPage = page, isSilent = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!isSilent) {
        setLoading(true);
      }

      const queryParams = {
        page: targetPage,
        page_size: PAGE_SIZE,
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      };

      if (search) {
        queryParams.search = search;
      }

      if (verificationFilter !== "All") {
        queryParams.verification_status = verificationFilter.toLowerCase();
      }

      const response = await axiosInstance.get(
        `hrm_web/employee_bank_accounts/`,
        {
          params: queryParams,
          signal: controller.signal,
        },
      );

      const result = response.data;
      const rows = result.results || result.data || result;

      setBankAccounts(Array.isArray(rows) ? rows : []);
      setTotalCount(
        result.count ?? result.total ?? (Array.isArray(rows) ? rows.length : 0),
      );
    } catch (error) {
      if (error.name !== "CanceledError" && error.name !== "AbortError") {
        console.error("Failed to fetch bank accounts:", error);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, verificationFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(
      () => {
        fetchBankAccounts(page);
      },
      search ? 350 : 0,
    );
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, verificationFilter, page]);

  const formatVerifiedDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ==========================================
  // SweetAlert2 Delete Handler
  // ==========================================
  const handleDeleteWithSwal = (account) => {
    const accountId = account.bank_id ?? account.id;
    const employeeName =
      account.employee_name || account.account_name || "this employee";

    Swal.fire({
      title: "Are you sure?",
      html: `You want to delete this bank account for <strong>${employeeName}</strong>?<br/>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true, // Swaps cancel and confirm buttons
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show Loading State in Swal
          Swal.fire({
            title: "Deleting...",
            text: "Please wait while we delete the record.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await axiosInstance.delete(
            `hrm_web/employee_bank_accounts/${accountId}/`,
          );

          // Success Message
          Swal.fire({
            title: "Deleted!",
            text: "Bank account has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#01925E",
          });

          // Refresh the table & stats
          fetchBankAccounts(page, true);
          fetchDashboardStats();
        } catch (error) {
          console.error("Failed to delete bank account:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the bank account. Please try again later.",
            icon: "error",
            confirmButtonColor: "#EF4444",
          });
        }
      }
    });
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
        fontFamily: TABLE_BODY_FONT.fontFamily,
        color: "#1F2937",
        overflowX: "hidden",
        width: "100%",
      }}
    >
      <Box
        sx={{
          minHeight: "calc(100vh - 48px)",
          px: { xs: 1, sm: 1.5, md: 2 },
          py: { xs: 0.8, sm: 1, md: 1.2 },
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <CustomBreadcrumbs />

        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 1.5, md: 1.5 },
            alignItems: "stretch",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            minWidth: 0,
          }}
        >
          {/* LEFT SIDEBAR */}
          <Box sx={{ width: { xs: "100%", md: 205, lg: 215 }, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid #E6E9ED",
                borderRadius: "9px",
                p: { xs: 1, sm: 1.2 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 0.5,
                  mb: 1.2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    color: "#18202A",
                  }}
                >
                  Bank Account
                  <br />
                  Verification
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  onClick={() => {
                    setEditAccount(null);
                    setAddBankModalOpen(true);
                  }}
                  sx={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
                    boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 1.5,
                    py: 0.5,
                    "&:hover": {
                      background:
                        "linear-gradient(225deg, #C81A2B 14.64%, #E53945 85.36%)",
                      boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                    },
                  }}
                >
                  Add Bank
                </Button>
              </Box>

              <Box
                component={motion.div}
                variants={leftSidebarVariants}
                initial="hidden"
                animate="visible"
              >
                <StatCard
                  value={dashboardStats.total || "0"}
                  label="Total"
                  valueColor="#01925E"
                  background="#F1FBF8"
                  border="#D5F2E9"
                  icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 24 }} />}
                />

                <StatCard
                  value={dashboardStats.verified || "0"}
                  label="Verified"
                  valueColor="#0064FB"
                  background="#F3F8FE"
                  border="#DEECFC"
                  icon={<VerifiedOutlinedIcon sx={{ fontSize: 24 }} />}
                />

                <StatCard
                  value={dashboardStats.pending || "0"}
                  label="Pending"
                  valueColor="#FD8E13"
                  background="#FEFAF4"
                  border="#FEF2E0"
                  icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 24 }} />}
                />

                <StatCard
                  value={dashboardStats.on_hold || "0"}
                  label="On Hold"
                  valueColor="#7D1CF3"
                  background="#F9F7FD"
                  border="#F3EBFC"
                  icon={
                    <PauseCircleOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                  }
                />
              </Box>
            </Paper>
          </Box>

          {/* RIGHT CONTENT */}
          <Box
            component={motion.div}
            variants={rightContentVariants}
            initial="hidden"
            animate="visible"
            sx={{ flex: 1, minWidth: 0, width: "100%", overflow: "hidden" }}
          >
            {/* SEARCH + FILTER */}
            <Paper
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid #E6E9ED",
                borderRadius: "9px",
                p: { xs: 1, sm: 1.2 },
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by employee or bank..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 15, color: "#A0A7B0" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                      borderRadius: "6px",
                      fontFamily: TABLE_BODY_FONT.fontFamily,
                      fontSize: 10.5,
                      background: "#FAFBFC",
                      "& fieldset": { borderColor: "#E4E7EB" },
                      "&:hover fieldset": { borderColor: "#C8CDD3" },
                      "&.Mui-focused fieldset": { borderColor: "#073F35" },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.5,
                  mt: 0.9,
                }}
              >
                <Typography sx={{ fontSize: 9.5, color: "#9AA1A9", mr: 0.2 }}>
                  Verification:
                </Typography>
                {["All", "Verified", "Pending"].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    onClick={() => setVerificationFilter(item)}
                    sx={{
                      height: 20,
                      borderRadius: "5px",
                      fontSize: 8.5,
                      fontWeight: verificationFilter === item ? 700 : 500,
                      background:
                        verificationFilter === item ? "#073F35" : "#F8FAFC",
                      color: verificationFilter === item ? "#fff" : "#4B5563",
                      border:
                        verificationFilter === item
                          ? "none"
                          : "1px solid #E6E9ED",
                      cursor: "pointer",
                      "&:hover": {
                        background:
                          verificationFilter === item ? "#073F35" : "#F0F2F4",
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>

            {/* TABLE */}
            <Paper
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid #E6E9ED",
                borderRadius: "9px",
                overflow: "hidden",
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  overflowX: "hidden",
                  overflowY: "hidden",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                  {/* HEADER */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridColumns,
                      alignItems: "center",
                      minHeight: 40,
                      pl: 0.9,
                      pr: 1.1,
                      borderBottom: "1px solid #E8EBEF",
                      background: "#FCFDFE",
                      width: "100%",
                      minWidth: 0,
                      boxSizing: "border-box",
                    }}
                  >
                    {[
                      { label: "EMPLOYEE", align: "left" },
                      { label: "BANK", align: "left" },
                      { label: "ACCOUNT NUMBER", align: "left" },
                      { label: "ROUTING NUMBER", align: "left" },
                      { label: "TYPE", align: "center" },
                      { label: "VERIFIED", align: "center" },
                      { label: "PAY STATUS", align: "center" },
                      { label: "VERIFIED ON", align: "center" },
                      { label: "ACTIONS", align: "center" },
                    ].map((col) => (
                      <Typography
                        key={col.label}
                        sx={{
                          ...TABLE_HEADER_FONT,
                          textAlign: col.align,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minWidth: 0,
                          pr: col.align === "right" ? 0.5 : 0,
                        }}
                      >
                        {col.label}
                      </Typography>
                    ))}
                  </Box>

                  {/* ROWS */}
                  <Box
                    component={motion.div}
                    sx={{ width: "100%", minWidth: 0, position: "relative" }}
                  >
                    <AnimatePresence>
                      {bankAccounts.map((account, index) => (
                        <Box
                          component={motion.div}
                          layout
                          custom={index}
                          variants={rowVariant}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          key={account.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: tableGridColumns,
                            alignItems: "center",
                            minHeight: 46,
                            pl: 0.9,
                            pr: 1.1,
                            borderBottom:
                              index === bankAccounts.length - 1
                                ? "none"
                                : "1px solid #F0F2F4",
                            transition: "background 0.2s",
                            width: "100%",
                            minWidth: 0,
                            overflow: "hidden",
                            boxSizing: "border-box",
                            "&:hover": { background: "#FAFCFB" },
                          }}
                        >
                          {/* EMPLOYEE */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.6,
                              minWidth: 0,
                              overflow: "hidden",
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 22,
                                height: 22,
                                fontSize: 10,
                                fontWeight: 700,
                                background: "#0B6658",
                                flexShrink: 0,
                                textTransform: "capitalize",
                              }}
                            >
                              {account.employee?.name?.charAt(0) ||
                                account.account_name?.charAt(0) ||
                                "E"}
                            </Avatar>
                            <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                              <Typography
                                sx={{
                                  ...TABLE_BODY_FONT_STRONG,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {account?.employee_name}
                              </Typography>
                              <Typography
                                sx={{
                                  ...TABLE_BODY_FONT_MUTED,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontSize: ".7rem",
                                }}
                              >
                                {account.employee || account.employee_id}
                              </Typography>
                            </Box>
                          </Box>

                          {/* BANK */}
                          <Typography
                            sx={{
                              ...TABLE_BODY_FONT,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                              fontSize: ".7rem",
                            }}
                          >
                            <Box
                              component="span"
                              sx={{ fontSize: 8, color: "#A0A7B0", mr: 0.3 }}
                            >
                              ◈
                            </Box>
                            {account.bank_name}
                          </Typography>

                          {/* ACCOUNT NUMBER */}
                          <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                            <Typography
                              sx={{
                                ...TABLE_BODY_FONT,
                                display: "inline-flex",
                                alignItems: "center",
                                maxWidth: "100%",
                                background: "#F1F4F7",
                                borderRadius: "3px",
                                px: 0.5,
                                py: 0.25,
                                fontSize: ".7rem",
                                color: "#59636E",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {account.account_number}
                            </Typography>
                          </Box>

                          {/* ROUTING NUMBER */}
                          <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                            <Typography
                              sx={{
                                ...TABLE_BODY_FONT,
                                display: "inline-flex",
                                alignItems: "center",
                                maxWidth: "100%",
                                background: "#F1F4F7",
                                borderRadius: "3px",
                                px: 0.5,
                                py: 0.25,
                                fontSize: ".7rem",
                                color: "#59636E",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {account.routing_number}
                            </Typography>
                          </Box>

                          {/* TYPE */}
                          <Typography
                            sx={{
                              ...TABLE_BODY_FONT,
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                              textTransform: "capitalize",
                            }}
                          >
                            {account.account_type}
                          </Typography>

                          {/* VERIFIED */}
                          <Box
                            sx={{
                              minWidth: 0,
                              overflow: "hidden",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                ...TABLE_BODY_FONT,
                                textTransform: "capitalize",
                                fontWeight: 700,
                                color:
                                  (
                                    account.verification_status || "Pending"
                                  ).toLowerCase() === "verified"
                                    ? "#15956E"
                                    : (
                                          account.verification_status ||
                                          "Pending"
                                        ).toLowerCase() === "pending"
                                      ? "#E59A00"
                                      : "#EF3340",
                              }}
                            >
                              {account.verification_status || "Pending"}
                            </Typography>
                          </Box>

                          {/* PAY STATUS */}
                          <Box
                            sx={{
                              minWidth: 0,
                              overflow: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              fontSize: ".7rem",
                            }}
                          >
                            <PayStatusChip status={account.pay_status} />
                          </Box>

                          {/* VERIFIED ON */}
                          <Typography
                            sx={{
                              ...TABLE_BODY_FONT,
                              fontSize: ".7rem",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                            }}
                          >
                            {formatVerifiedDate(account.verified_on)}
                          </Typography>

                          {/* ACTIONS: VIEW, EDIT, DELETE (with Swal) */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            {/* VIEW */}
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setViewModalOpen(true);
                                }}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  color: "#2878FF",
                                  "&:hover": { background: "#EEF5FF" },
                                }}
                              >
                                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>

                            {/* EDIT */}
                            <Tooltip title="Edit Bank">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditAccount(account);
                                  setAddBankModalOpen(true);
                                }}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  color: "#0B6658",
                                  "&:hover": { background: "#EBF6F4" },
                                }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>

                            {/* DELETE WITH SWAL */}
                            <Tooltip title="Delete Bank">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteWithSwal(account)}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  color: "#EF4444",
                                  "&:hover": { background: "#FEF2F2" },
                                }}
                              >
                                <DeleteOutlineOutlinedIcon
                                  sx={{ fontSize: 16 }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))}
                    </AnimatePresence>
                  </Box>

                  {/* NO DATA */}
                  {!loading && bankAccounts.length === 0 && (
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      sx={{ py: 5, textAlign: "center" }}
                    >
                      <Typography
                        sx={{
                          ...TABLE_BODY_FONT,
                          fontSize: 12,
                          color: "#8A929B",
                        }}
                      >
                        No bank accounts found
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* PAGINATION FOOTER */}
              {totalCount > 0 && (
                <CustomPagination
                  page={page}
                  totalItems={totalCount}
                  itemsPerPage={PAGE_SIZE}
                  onPageChange={(nextPage) => setPage(nextPage)}
                />
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* MODALS */}
      <AddBankAccountModal
        open={addBankModalOpen}
        editData={editAccount}
        onClose={() => {
          setAddBankModalOpen(false);
          setEditAccount(null);
        }}
        onSave={() => {
          fetchBankAccounts(page, true);
          fetchDashboardStats();
        }}
      />

      <ViewBankAccountModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        account={selectedAccount}
        refreshData={() => {
          fetchBankAccounts(page, true);
          fetchDashboardStats();
        }}
        onEdit={(acc) => {
          setEditAccount(acc);
          setViewModalOpen(false);
          setAddBankModalOpen(true);
        }}
      />
    </Box>
  );
}
