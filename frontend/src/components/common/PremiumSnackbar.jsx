import { Box, Typography, IconButton, Snackbar } from "@mui/material";
import { motion } from "framer-motion";

// Icons
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Mapping different types of alerts to their colors and icons
const alertStyles = {
  success: {
    icon: <CheckCircleOutlineRoundedIcon sx={{ fontSize: "18px" }} />,
    color: "#16A34A", // Success Green[cite: 1]
    bg: "#F0FDF4",    // Success Green BG[cite: 1]
  },
  error: {
    icon: <ErrorOutlineRoundedIcon sx={{ fontSize: "18px" }} />,
    color: "#D91F26", // Error Red[cite: 1]
    bg: "#FEF2F2",    // Error Red BG[cite: 1]
  },
  warning: {
    icon: <WarningAmberRoundedIcon sx={{ fontSize: "18px" }} />,
    color: "#D97706", // Warning Amber[cite: 1]
    bg: "#FFFBEB",    // Warning Amber BG[cite: 1]
  },
  info: {
    icon: <InfoOutlinedIcon sx={{ fontSize: "18px" }} />,
    color: "#3B82F6", // Sky Blue
    bg: "rgba(59, 130, 246, 0.15)",
  },
};

export default function PremiumSnackbar({
  open,
  setOpen,
  type = "success", // default is success
  title,
  message,
  duration = 4000,
}) {
  const currentStyle = alertStyles[type] || alertStyles.success;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ mb: 3, mr: 3 }} 
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5, 
          p: 1.5, 
          minWidth: "280px", 
          maxWidth: "360px",
          borderRadius: "14px", 
          position: "relative",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.9)",
          borderLeft: `4px solid ${currentStyle.color}`,
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
        }}
      >
        {open && (
          <Box
            component={motion.div}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "2px", 
              backgroundColor: currentStyle.color,
              opacity: 0.5,
            }}
          />
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: currentStyle.bg,
            color: currentStyle.color,
            flexShrink: 0,
            mt: 0.2, 
          }}
        >
          {currentStyle.icon}
        </Box>

        {/* Text Content (Compact Fonts) */}
        <Box sx={{ flex: 1, pt: 0.2 }}>
          <Typography
            sx={{
              fontSize: "13px", 
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.2px",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {message && (
            <Typography
              sx={{
                fontSize: "11.5px", 
                fontWeight: 500,
                color: "#64748B",
                mt: 0.5,
                lineHeight: 1.3,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>

        {/* Close Button (Clean look) */}
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            p: 0.5,
            mt: -0.2,
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#E2E8F0",
              transform: "scale(1.1)",
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: "14px", color: "#64748B" }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}