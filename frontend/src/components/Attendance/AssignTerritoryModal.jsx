import React from "react";
import {
  Modal, // <--- Dialog ki jagah ab Modal use kar rahe hain
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Modal ko center mein fix rakhne ke liye strict styling
const modalContainerStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "600px", // Fixed width
  maxWidth: "90vw", // Mobile ke liye max width
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px 28px",
  boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.08)",
  outline: "none", // Focus karne par default border hatane ke liye
  boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif",
};

const AssignTerritoryModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay
          },
        },
      }}
    >
      <Box sx={modalContainerStyle}>
        {/* ================= HEADER ================= */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexShrink: 0,
          }}
        >
          <Typography
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Assign Territory
          </Typography>

          <IconButton
            onClick={onClose}
            disableRipple
            style={{
              padding: 0,
              color: "#94a3b8",
              width: "24px",
              height: "24px",
            }}
          >
            <CloseIcon style={{ fontSize: "20px" }} />
          </IconButton>
        </Box>

        {/* ================= FORM ================= */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          {/* Territory / Zone */}
          <Box>
            <Typography sx={labelStyles}>Territory / Zone</Typography>
            <TextField fullWidth variant="outlined" sx={textFieldStyles} />
          </Box>

          {/* Employee */}
          <Box>
            <Typography sx={labelStyles}>Employee</Typography>
            <TextField fullWidth variant="outlined" sx={textFieldStyles} />
          </Box>

          {/* Primary Role */}
          <Box>
            <Typography sx={labelStyles}>Primary Role</Typography>
            <TextField fullWidth variant="outlined" sx={textFieldStyles} />
          </Box>

          {/* Geo Fence */}
          <Box>
            <Typography sx={labelStyles}>Geo-fence Radius (km)</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="2.5"
              sx={textFieldStyles}
            />
          </Box>
        </Box>

        {/* ================= BUTTONS ================= */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "32px",
            flexShrink: 0,
          }}
        >
          {/* Assign */}
          <Button
            variant="contained"
            onClick={onClose}
            disableElevation
            sx={{
              flex: 1,
              height: "42px !important",
              minHeight: "42px !important",
              borderRadius: "50px !important",
              backgroundColor: "#ef233c !important",
              color: "#ffffff !important",
              fontSize: "14px !important",
              fontWeight: "600 !important",
              textTransform: "none !important",
              padding: "0 !important",
              "&:hover": {
                backgroundColor: "#d91f35 !important",
              },
            }}
          >
            Assign
          </Button>

          {/* Cancel */}
          <Button
            variant="outlined"
            onClick={onClose}
            disableElevation
            sx={{
              width: "100px !important",
              minWidth: "100px !important",
              height: "42px !important",
              minHeight: "42px !important",
              borderRadius: "50px !important",
              color: "#475569 !important",
              borderColor: "#e2e8f0 !important",
              backgroundColor: "#ffffff !important",
              fontSize: "14px !important",
              fontWeight: "600 !important",
              textTransform: "none !important",
              padding: "0 !important",
              "&:hover": {
                borderColor: "#cbd5e1 !important",
                backgroundColor: "#f8fafc !important",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Global CSS (Tailwind etc) ko override karne ke liye strict styles
const labelStyles = {
  fontSize: "12px !important",
  fontWeight: "600 !important",
  color: "#475569 !important",
  margin: "0 0 6px 0 !important",
  display: "block",
};

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    height: "40px !important",
    minHeight: "40px !important",
    borderRadius: "50px !important",
    backgroundColor: "#ffffff !important",
    padding: "0 !important",
    "& fieldset": { borderColor: "#e2e8f0 !important" },
    "&:hover fieldset": { borderColor: "#cbd5e1 !important" },
    "&.Mui-focused fieldset": {
      borderColor: "#94a3b8 !important",
      borderWidth: "1px !important",
    },
  },
  "& input": {
    height: "40px !important",
    boxSizing: "border-box !important",
    padding: "0 16px !important",
    fontSize: "13px !important",
    color: "#1e293b !important",
    display: "flex",
    alignItems: "center",
  },
  "& input::placeholder": {
    color: "#94a3b8 !important",
    opacity: "1 !important",
  },
};

export default AssignTerritoryModal;
