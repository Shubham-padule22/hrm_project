import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  Card,
  Avatar,
  Chip,
  TextField,
  Breadcrumbs,
  Link,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  InputAdornment,
} from "@mui/material";
import CustomLoader from "../../components/common/CustomLoader";
import CustomPagination from "../../components/common/Custompagination";

import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  FileDownload as ExportIcon,
  CheckCircleOutlined as CheckIcon,
  HighlightOff as CancelIcon,
  EditOutlined as EditIcon,
  OpenInNew as LaunchIcon,
  MoreHoriz as MoreIcon,
  PersonOutlined as PersonIcon,
  PeopleOutlined as PeopleIcon,
  VerifiedUserOutlined as ShieldIcon,
  GppBadOutlined as FailedIcon,
  AutoAwesome as AiIcon,
} from "@mui/icons-material";

/* ======================================================================
   API LAYER — plug the real endpoint in here when it's ready.
   Everything below returns the same shape the table already expects,
   so no other code needs to change.
   ====================================================================== */

// STEP 1: jab API ready ho, yahan URL daal do (e.g. "/api/system-users")
const USERS_API_ENDPOINT = null; // <-- set this, e.g. "https://yourdomain.com/api/system-users"

// Fallback/mock data — used only while USERS_API_ENDPOINT is null
const mockUserData = [
  {
    id: "1",
    initials: "PS",
    user: "Priya Sharma",
    email: "priya.s@nemtcare.com",
    role: "HR Manager",
    mfa: "Enabled",
    devices: 2,
    active_sessions: 1,
    last_login: "2 min ago",
    status: "Active",
  },
  {
    id: "2",
    initials: "KN",
    user: "Kevin Nakamura",
    email: "kevin.n@nemtcare.com",
    role: "Super Admin",
    mfa: "Enabled",
    devices: 3,
    active_sessions: 2,
    last_login: "1 hour ago",
    status: "Active",
  },
  {
    id: "3",
    initials: "TB",
    user: "Tyler Brooks",
    email: "tyler.b@nemtcare.com",
    role: "Operations Manager",
    mfa: "Disabled",
    devices: 1,
    active_sessions: 1,
    last_login: "3 hours ago",
    status: "Active",
  },
  {
    id: "4",
    initials: "TH",
    user: "Tom Harris",
    email: "tom.h@nemtcare.com",
    role: "Finance Controller",
    mfa: "Enabled",
    devices: 2,
    active_sessions: 0,
    last_login: "Yesterday",
    status: "Active",
  },
  {
    id: "5",
    initials: "DF",
    user: "Diana Foster",
    email: "diana.f@nemtcare.com",
    role: "Viewer",
    mfa: "Disabled",
    devices: 1,
    active_sessions: 0,
    last_login: "3 days ago",
    status: "Suspended",
  },
  {
    id: "6",
    initials: "LW",
    user: "Lisa Wong",
    email: "lisa.w@nemtcare.com",
    role: "Dispatch Supervisor",
    mfa: "Enabled",
    devices: 2,
    active_sessions: 1,
    last_login: "30 min ago",
    status: "Active",
  },
  {
    id: "7",
    initials: "RM",
    user: "Rahul Mehta",
    email: "rahul.m@nemtcare.com",
    role: "Operations Manager",
    mfa: "Enabled",
    devices: 2,
    active_sessions: 1,
    last_login: "5 min ago",
    status: "Active",
  },
  {
    id: "8",
    initials: "SA",
    user: "Sara Ahmed",
    email: "sara.a@nemtcare.com",
    role: "Viewer",
    mfa: "Disabled",
    devices: 1,
    active_sessions: 0,
    last_login: "2 hours ago",
    status: "Active",
  },
  {
    id: "9",
    initials: "JC",
    user: "James Cole",
    email: "james.c@nemtcare.com",
    role: "HR Manager",
    mfa: "Enabled",
    devices: 2,
    active_sessions: 1,
    last_login: "15 min ago",
    status: "Active",
  },
  {
    id: "10",
    initials: "NP",
    user: "Neha Patil",
    email: "neha.p@nemtcare.com",
    role: "Finance Controller",
    mfa: "Enabled",
    devices: 1,
    active_sessions: 0,
    last_login: "Yesterday",
    status: "Active",
  },
  {
    id: "11",
    initials: "VK",
    user: "Vikram Kulkarni",
    email: "vikram.k@nemtcare.com",
    role: "Dispatch Supervisor",
    mfa: "Disabled",
    devices: 1,
    active_sessions: 1,
    last_login: "40 min ago",
    status: "Active",
  },
  {
    id: "12",
    initials: "AB",
    user: "Anita Bose",
    email: "anita.b@nemtcare.com",
    role: "Super Admin",
    mfa: "Enabled",
    devices: 3,
    active_sessions: 2,
    last_login: "10 min ago",
    status: "Active",
  },
  {
    id: "13",
    initials: "MS",
    user: "Mark Silva",
    email: "mark.s@nemtcare.com",
    role: "Viewer",
    mfa: "Disabled",
    devices: 1,
    active_sessions: 0,
    last_login: "6 days ago",
    status: "Suspended",
  },
  {
    id: "14",
    initials: "PR",
    user: "Pooja Rane",
    email: "pooja.r@nemtcare.com",
    role: "Operations Manager",
    mfa: "Enabled",
    devices: 2,
    active_sessions: 1,
    last_login: "1 hour ago",
    status: "Active",
  },
];

/**
 * fetchUsers — single place that decides mock vs real API.
 * Jaise hi USERS_API_ENDPOINT set hoga, yeh automatically real fetch use karega.
 * Table, loading state, animations — kuch bhi manually change karne ki zarurat nahi.
 */
async function fetchUsers() {
  if (!USERS_API_ENDPOINT) {
    // Mock mode — simulate small network delay so loading UI is testable
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockUserData;
  }

  // STEP 2: real API mode — uncomment/adjust as needed for auth headers etc.
  const response = await fetch(USERS_API_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const data = await response.json();
  // If your API wraps the array (e.g. { users: [...] }), adjust this line:
  return data.users ?? data;
}

/* ====================================================================== */

const roleColors = {
  "HR Manager": { bg: "#E0F2FE", text: "#0284C7" },
  "Super Admin": { bg: "#FEE2E2", text: "#DC2626" },
  "Operations Manager": { bg: "#F1F5F9", text: "#475569" },
  "Finance Controller": { bg: "#FFEDD5", text: "#EA580C" },
  Viewer: { bg: "#F1F5F9", text: "#94A3B8" },
  "Dispatch Supervisor": { bg: "#F3E8FF", text: "#9333EA" },
};

const statusColors = {
  Active: { bg: "#DCFCE7", text: "#16A34A" },
  Suspended: { bg: "#FEE2E2", text: "#DC2626" },
};

/* ---------- Motion variants ---------- */
const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const kpiVariant = {
  hidden: { opacity: 0, x: -12 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, delay: 0.15 + i * 0.08, ease: "easeOut" },
  }),
};

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: "easeOut" },
  }),
};

const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);
const MotionBox = motion(Box);

const KPICard = ({ icon, bg, color, number, label, index = 0 }) => (
  <MotionBox
    custom={index}
    variants={kpiVariant}
    initial="hidden"
    animate="visible"
    whileHover={{ scale: 1.02 }}
    sx={{
      display: "flex",
      alignItems: "center",
      p: 1.5,
      borderRadius: 2.5,
      bgcolor: bg,
      cursor: "default",
      height: "100%",
      flex: "1 1 150px",
      minWidth: 150,
    }}
  >
    <Avatar
      sx={{
        bgcolor: "transparent",
        color: color,
        mr: 1.5,
        width: 32,
        height: 32,
      }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: color,
          lineHeight: 1.1,
          fontSize: "1.25rem",
        }}
      >
        {number}
      </Typography>
      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  </MotionBox>
);

export default function SystemUsers() {
  const [userData, setUserData] = useState(mockUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // ITEMS_PER_PAGE is fixed for now (client-side pagination over the mock
  // array). Once a real API is wired up, this should become the `limit`
  // you send in the request, and TOTAL_USERS should come from the API's
  // total count (e.g. `data.total`) instead of `userData.length` — the
  // API would then only ever return one page's worth of rows, and you'd
  // call fetchUsers(page) again inside handlePageChange below.
  const ITEMS_PER_PAGE = 6;
  const TOTAL_USERS = userData.length;

  const paginatedUsers = userData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    // TODO: for a real API, call loadUsers(nextPage) here instead —
    // client-side slicing above is only correct while all rows are
    // already loaded in memory (mock mode).
  };

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUserData(data);
      setPage(1);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <Box
      sx={{
        pt: 0.5,
        pb: 2,
        pl: { xs: 1.25, sm: 2 },
        pr: { xs: 1.25, sm: 2 },
        bgcolor: "#F5F7F9",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Breadcrumbs */}
      <Box sx={{ mb: 1.5 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ fontSize: "0.8rem", color: "#64748b" }}
        >
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/">
            Settings
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontSize: "0.8rem", fontWeight: 700 }}
          >
            User Accounts
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Side-by-Side Flex Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Left Column (Fixed Width) */}
        <Box
          sx={{
            width: { xs: "100%", lg: "280px" },
            flexShrink: 0,
          }}
        >
          <MotionCard
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            custom={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              border: "none",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "#0F172A",
                  fontSize: "0.95rem",
                }}
              >
                System Users <br /> & Security
              </Typography>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                sx={{
                  bgcolor: "#EF4444",
                  color: "#fff",
                  borderRadius: 6,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  boxShadow: "none",
                  px: 1.5,
                  py: 0.5,
                  "&:hover": { bgcolor: "#DC2626", boxShadow: "none" },
                }}
              >
                Add User
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <KPICard
                index={0}
                icon={<PersonIcon />}
                bg="#F0FDF4"
                color="#16A34A"
                number="447"
                label="System Users"
              />
              <KPICard
                index={1}
                icon={<PeopleIcon />}
                bg="#EFF6FF"
                color="#2563EB"
                number="89"
                label="Active Now"
              />
              <KPICard
                index={2}
                icon={<ShieldIcon />}
                bg="#FFF7ED"
                color="#EA580C"
                number="12,840"
                label="MFA Enabled"
              />
              <KPICard
                index={3}
                icon={<FailedIcon />}
                bg="#FAF5FF"
                color="#9333EA"
                number="6"
                label="Failed Logins (24h)"
              />
            </Box>
          </MotionCard>

          {/* AI Insights Card */}
          <MotionCard
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            custom={0.15}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#FDF4FF",
              boxShadow: "none",
              border: "1px solid #F5D0FE",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Avatar sx={{ bgcolor: "#9333EA", width: 22, height: 22 }}>
                  <AiIcon sx={{ fontSize: 12, color: "#fff" }} />
                </Avatar>
              </motion.div>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: "#7E22CE", fontSize: "0.85rem" }}
              >
                AI Insights
              </Typography>
            </Stack>
            <Box
              component="ul"
              sx={{
                pl: 2,
                m: 0,
                color: "#9333EA",
                fontSize: "0.7rem",
                fontWeight: 500,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                "& li": { paddingLeft: "2px" },
              }}
            >
              <li>
                14 users have MFA disabled — recommend enforcing
                organization-wide MFA
              </li>
              <li>
                Diana Foster had 3 failed login attempts from an unknown IP —
                account suspended
              </li>
              <li>Kevin Nakamura has 2 active sessions — review if expected</li>
              <li>
                Super Admin access is granted to 3 users — consider reducing
                scope
              </li>
            </Box>
          </MotionCard>
        </Box>

        {/* Right Column (Flexible Width Table Area) */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <MotionCard
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            custom={0.1}
            sx={{
              p: { xs: 1.5, sm: 2.5 },
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              border: "none",
              overflow: "hidden",
            }}
          >
            {/* Search and Filters Bar */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search users by name, email, role..."
                size="small"
                sx={{ flex: "1 1 220px", minWidth: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: "#F8FAFC",
                    borderRadius: 2,
                    fontSize: "0.85rem",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
              <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  variant="outlined"
                  startIcon={
                    <FilterIcon sx={{ color: "#64748b", fontSize: 16 }} />
                  }
                  size="small"
                  sx={{
                    borderRadius: 2,
                    color: "#475569",
                    borderColor: "#E2E8F0",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Filters
                </Button>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  variant="outlined"
                  startIcon={
                    <SortIcon sx={{ color: "#64748b", fontSize: 16 }} />
                  }
                  size="small"
                  sx={{
                    borderRadius: 2,
                    color: "#475569",
                    borderColor: "#E2E8F0",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Sort
                </Button>
              </Stack>
            </Box>

            {/* Data Table */}
            <TableContainer sx={{ overflowX: "unset", width: "100%" }}>
              <Table
                sx={{ width: "100%", minWidth: 680, tableLayout: "fixed" }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      { label: "USER", width: "24%" },
                      { label: "ROLE", width: "14%" },
                      { label: "MFA", width: "10%" },
                      { label: "DEVICES", width: "8%" },
                      { label: "ACTIVE SESSIONS", width: "13%" },
                      { label: "LAST LOGIN", width: "12%" },
                      { label: "STATUS", width: "10%" },
                      { label: "ACTIONS", width: "9%" },
                    ].map((head) => (
                      <TableCell
                        key={head.label}
                        sx={{
                          width: head.width,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: "#94A3B8",
                          borderBottom: "1px solid #F1F5F9",
                          py: 1.5,
                          px: 1,
                        }}
                      >
                        {head.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: "none", py: 2 }}>
                        <CustomLoader
                          message="Loading users..."
                          height="220px"
                        />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: "none", py: 4 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "#DC2626", textAlign: "center" }}
                        >
                          {error}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {paginatedUsers.map((row, i) => (
                        <MotionTableRow
                          key={row.id}
                          custom={i}
                          variants={rowVariant}
                          initial="hidden"
                          animate="visible"
                          sx={{
                            "&:hover": {
                              bgcolor: "#F8FAFC",
                            },
                            "& td": {
                              borderBottom: "1px solid #F8FAFC",
                              py: 1.5,
                              px: 1,
                            },
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 30,
                                  height: 30,
                                  bgcolor: "#064E3B",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                {row.initials}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#0F172A",
                                    fontSize: "0.8rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {row.user}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    fontSize: "0.7rem",
                                    display: "block",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {row.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={row.role}
                              size="small"
                              sx={{
                                bgcolor: roleColors[row.role]?.bg,
                                color: roleColors[row.role]?.text,
                                fontWeight: 700,
                                fontSize: "0.6rem",
                                borderRadius: 1.5,
                                height: "20px",
                                maxWidth: "100%",
                                "& .MuiChip-label": {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              {row.mfa === "Enabled" ? (
                                <CheckIcon
                                  sx={{ fontSize: 14, color: "#16A34A" }}
                                />
                              ) : (
                                <CancelIcon
                                  sx={{ fontSize: 14, color: "#DC2626" }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    row.mfa === "Enabled"
                                      ? "#16A34A"
                                      : "#DC2626",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                }}
                              >
                                {row.mfa}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Box
                                component="span"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                💻
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 500,
                                  fontSize: "0.7rem",
                                }}
                              >
                                {row.devices}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            {row.active_sessions > 0 ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#16A34A",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.active_sessions} session
                                {row.active_sessions > 1 ? "s" : ""}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#94A3B8",
                                  fontWeight: 500,
                                  fontSize: "0.7rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                0 sessions
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#64748b",
                                fontWeight: 500,
                                fontSize: "0.7rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.last_login}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                bgcolor: statusColors[row.status]?.bg,
                                color: statusColors[row.status]?.text,
                                fontWeight: 700,
                                fontSize: "0.6rem",
                                borderRadius: 1.5,
                                height: "20px",
                                maxWidth: "100%",
                                "& .MuiChip-label": {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                component={motion.button}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                size="small"
                                sx={{ color: "#3B82F6", p: 0.5 }}
                              >
                                <EditIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                              <IconButton
                                component={motion.button}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                size="small"
                                sx={{ color: "#EF4444", p: 0.5 }}
                              >
                                <LaunchIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                              <IconButton
                                component={motion.button}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                size="small"
                                sx={{ color: "#94A3B8", p: 0.5 }}
                              >
                                <MoreIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </MotionTableRow>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination / Footer area */}
            <CustomPagination
              page={page}
              totalItems={TOTAL_USERS}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </MotionCard>
        </Box>
      </Box>
    </Box>
  );
}
