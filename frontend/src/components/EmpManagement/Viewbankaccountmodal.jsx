import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../Config/axiosInstance";
import PremiumSnackbar from "../common/PremiumSnackbar";

// =========================================================
// DATE FORMAT
// =========================================================
const formatDate = (dateString) => {
  if (!dateString || dateString === "-") return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// =========================================================
// INPUT STYLE
// =========================================================
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    height: 48,
    borderRadius: "10px",
    background: "#FFFFFF",
    fontSize: 15,
    "& fieldset": {
      borderColor: "#E5E7EB",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "#B8BEC6",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#073F35",
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: 15,
    padding: "0 14px",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#9CA3AF",
    opacity: 1,
  },
};

// =========================================================
// READ ONLY FIELD
// =========================================================
const ViewField = ({ label, value, fullWidth = false }) => {
  return (
    <Box
      sx={{
        gridColumn: fullWidth
          ? {
              xs: "1",
              sm: "1 / -1",
            }
          : "auto",
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: "#4B5563",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        size="small"
        value={value || ""}
        InputProps={{
          readOnly: true,
        }}
        sx={{
          ...inputStyle,
          "& .MuiOutlinedInput-root": {
            ...inputStyle["& .MuiOutlinedInput-root"],
            background: "#F9FAFB",
          },
          "& .MuiInputBase-input": {
            ...inputStyle["& .MuiInputBase-input"],
            color: "#111827",
            fontWeight: 500,
          },
        }}
      />
    </Box>
  );
};

// =========================================================
// STATUS CHIP
// =========================================================
const StatusChip = ({ status, type = "verification" }) => {
  const normalizedStatus = String(status || "Pending").toLowerCase();

  let background = "#FFF1CF";
  let color = "#E59A00";

  if (type === "verification") {
    if (normalizedStatus === "verified") {
      background = "#E4F8F1";
      color = "#15956E";
    } else if (normalizedStatus === "rejected") {
      background = "#FDECEC";
      color = "#EF3340";
    } else if (normalizedStatus === "on_hold") {
      background = "#EEF1F5";
      color = "#64748B";
    }
  }

  if (type === "payment") {
    if (normalizedStatus === "active") {
      background = "#E4F8F1";
      color = "#15956E";
    } else if (normalizedStatus === "on hold") {
      background = "#EEF1F5";
      color = "#64748B";
    } else {
      background = "#FFF1CF";
      color = "#E59A00";
    }
  }

  return (
    <Chip
      label={status || "Pending"}
      size="small"
      sx={{
        height: 24,
        borderRadius: "6px",
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: background,
        color,
        textTransform: "capitalize",
        "& .MuiChip-label": {
          px: 1.5,
        },
      }}
    />
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================
const ViewBankAccountModal = ({ open, onClose, account, refreshData }) => {
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleClose = useCallback(() => {
    if (verifyLoading) return;
    onClose();
  }, [onClose, verifyLoading]);

  const handleVerification = async (nextStatus) => {
    const accountId = account?.bank_id ?? account?.id;
    if (!accountId) {
      setSnackbar({
        open: true,
        type: "error",
        title: "Error",
        message: "Bank account ID not found.",
      });
      return;
    }

    try {
      setVerifyLoading(true);
      await axiosInstance.post(
        `/hrm_web/employee_bank_accounts/${accountId}/verify/`,
        { verification_status: nextStatus },
      );

      setSnackbar({
        open: true,
        type: "success",
        title: "Success",
        message:
          nextStatus === "verified"
            ? "Account verified successfully."
            : "Account rejected successfully.",
      });

      if (refreshData) await refreshData();
      setTimeout(() => handleClose(), 700);
    } catch (error) {
      setSnackbar({
        open: true,
        type: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to update verification status.",
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  if (!account) return null;

  const accountId = account?.bank_id ?? account?.id;

  const employeeName =
    typeof account.employee === "object"
      ? account.employee?.name ||
        `${account.employee?.clg_first_name || ""} ${
          account.employee?.clg_last_name || ""
        }`.trim()
      : account.employee_name || account.account_name || "-";

  const employeeId =
    typeof account.employee === "object"
      ? (account.employee?.id ??
        account.employee?.clg_id ??
        account.employee?.refId ??
        account.employee?.clg_ref_id)
      : (account.employee_id ?? account.employee ?? "-");

  const employeeEmail =
    typeof account.employee === "object"
      ? account.employee?.email ||
        account.employee?.clg_email ||
        account.email ||
        "-"
      : account.email || "-";

  const currentStatus = String(
    account?.verification_status || "Pending",
  ).toLowerCase();

  const isBusy = verifyLoading;

  return (
    <>
      <Dialog
        open={open}
        onClose={isBusy ? undefined : handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 500,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,.15)",
            m: 1.5,
            background: "#FFFFFF",
          },
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <Box
          sx={{
            px: 3.5,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}
            >
              View Bank Account
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.25 }}>
              Bank Account #{accountId || "-"}
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            disabled={isBusy}
            size="small"
            sx={{
              color: "#9CA3AF",
              "&:hover": { background: "#F3F4F6" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <DialogContent
          sx={{
            p: 3.5,
            "&:last-child": { pb: 3.5 },
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* EMPLOYEE & BANK INFO */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <ViewField
                  label="Employee"
                  value={
                    employeeName !== "-"
                      ? `${employeeName} (${employeeId})`
                      : "-"
                  }
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ViewField label="Email" value={employeeEmail} />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <ViewField label="Bank Name" value={account.bank_name} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ViewField
                  label="Account Type"
                  value={
                    account.account_type
                      ? String(account.account_type).toUpperCase()
                      : "-"
                  }
                />
              </Box>
            </Box>

            {/* ACCOUNT INFO */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <ViewField
                  label="Account Number"
                  value={account.account_number}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ViewField label="Account Name" value={account.account_name} />
              </Box>
            </Box>

            <ViewField
              label="Bank Address"
              value={account.bank_address}
              fullWidth
            />
            <ViewField
              label="Bank Sort Code 6 Digit"
              value={account.routing_number}
              fullWidth
            />

            {/* STATUS SECTION */}
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#6B7280",
                  mb: 1.5,
                }}
              >
                ACCOUNT STATUS
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                    Verification:
                  </Typography>
                  <StatusChip
                    status={account.verification_status || "Pending"}
                    type="verification"
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                    Pay Status:
                  </Typography>
                  <StatusChip
                    status={account.pay_status || "Pending"}
                    type="payment"
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, color: "#4B5563" }}>
                    Verified On:
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}
                  >
                    {formatDate(account.verified_on)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* =====================================================
            FOOTER ACTIONS (VERIFICATION MOVED HERE)
        ===================================================== */}
        <Box
          sx={{
            px: 3.5,
            py: 2.5,
            borderTop: "1px solid #F3F4F6",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* LEFT - CLOSE */}
          <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              disabled={isBusy}
              sx={{
                height: 48,
                px: 4,
                borderRadius: "24px",
                borderColor: "#E5E7EB",
                color: "#4B5563",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { background: "#F9FAFB" },
              }}
            >
              Close
            </Button>
          </Box>

          {/* RIGHT - APPROVE / DECLINE */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", sm: "auto" },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleVerification("rejected")}
              disabled={isBusy || currentStatus === "rejected"}
              sx={{
                height: 48,
                px: 4,
                borderRadius: "24px",
                borderColor: "#E5E7EB",
                color: "#4B5563",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  background: "#FEF2F2",
                  borderColor: "#EF4444",
                  color: "#EF4444",
                },
                "&.Mui-disabled": {
                  background: "#F9FAFB",
                  color: "#9CA3AF",
                },
              }}
            >
              Decline Account
            </Button>

            <Button
              fullWidth
              onClick={() => handleVerification("verified")}
              disabled={isBusy || currentStatus === "verified"}
              startIcon={
                verifyLoading ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : null
              }
              sx={{
                height: 48,
                px: 4,
                borderRadius: "24px",
                background: "#073F35",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 8px 16px rgba(7, 63, 53, 0.2)",
                "&:hover": {
                  background: "#052F27",
                  boxShadow: "0 10px 20px rgba(7, 63, 53, 0.3)",
                },
                "&.Mui-disabled": {
                  background: "#E5E7EB",
                  color: "#9CA3AF",
                },
              }}
            >
              {verifyLoading ? "Processing..." : "Approve Account"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* SNACKBAR */}
      <PremiumSnackbar
        open={snackbar.open}
        setOpen={(val) => setSnackbar((prev) => ({ ...prev, open: val }))}
        type={snackbar.type}
        title={snackbar.title}
        message={snackbar.message}
      />
    </>
  );
};

export default ViewBankAccountModal;
