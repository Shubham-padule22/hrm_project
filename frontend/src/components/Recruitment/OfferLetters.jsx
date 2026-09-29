import React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import { TextField, InputAdornment } from "@mui/material";

// --- Mock Data ---
const offerData = [
  {
    id: 1,
    name: "Chris Donnelly",
    role: "Dispatch Coordinator",
    salary: "$50,000/year",
    status: "Sent",
    sentDate: "Jul 10, 2024",
    expireDate: "Jul 24, 2024",
    avatarBg: "#0C3328",
    initials: "CD",
  },
  {
    id: 2,
    name: "Robert Mensah",
    role: "Senior EMT Driver",
    salary: "$58,000/year",
    status: "Pending",
    sentDate: "Jul 12, 2024",
    expireDate: "Jul 26, 2024",
    avatarBg: "#0C3328",
    initials: "RM",
  },
];

export default function OfferLetters() {
  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Box
        sx={{
          width: "100%",
          minHeight: 48,

          mb: 1.4,

          px: {
            xs: 1.2,
            sm: 1.8,
          },

          py: {
            xs: 1,
            md: 0.9,
          },

          backgroundColor: "#FFFFFF",

          borderRadius: "10px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          gap: 1.5,

          flexWrap: "wrap",

          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            SEARCH + FILTER
        ================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            gap: 1.2,

            flex: 1,

            minWidth: 0,
          }}
        >
          {/* SEARCH */}

          <TextField
            placeholder="Search jobs, candidates, positions..."
            size="small"
            sx={{
              width: {
                xs: "100%",
                sm: 340,
                md: 455,
              },

              "& .MuiOutlinedInput-root": {
                height: 38,

                borderRadius: "9px",

                backgroundColor: "#F8FAFC",

                "& fieldset": {
                  border: "1px solid #E9EEF4",
                },

                "&:hover fieldset": {
                  borderColor: "#DDE4EC",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#DDE4EC",
                },
              },

              "& input": {
                fontSize: "12px",

                color: "#475569",

                padding: "8px 8px",
              },

              "& input::placeholder": {
                color: "#94A3B8",

                opacity: 1,

                fontSize: "12px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      fontSize: 17,
                      color: "#94A3B8",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* FILTER + SORT */}

          <Stack
            direction="row"
            spacing={0.7}
            sx={{
              flexShrink: 0,
            }}
          >
            <Button
              size="small"
              startIcon={
                <FilterAltOutlinedIcon
                  sx={{
                    fontSize: "14px !important",
                  }}
                />
              }
              sx={{
                height: 34,

                minWidth: 78,

                px: 1.2,

                borderRadius: "8px",

                textTransform: "none",

                fontSize: "11px",

                fontWeight: 500,

                color: "#64748B",

                backgroundColor: "#FFFFFF",

                border: "1px solid #E9EEF4",

                "&:hover": {
                  backgroundColor: "#F8FAFC",

                  borderColor: "#DDE4EC",
                },
              }}
            >
              Filters
            </Button>

            <Button
              size="small"
              startIcon={
                <SwapVertOutlinedIcon
                  sx={{
                    fontSize: "14px !important",
                  }}
                />
              }
              sx={{
                height: 34,

                minWidth: 67,

                px: 1.2,

                borderRadius: "8px",

                textTransform: "none",

                fontSize: "11px",

                fontWeight: 500,

                color: "#64748B",

                backgroundColor: "#FFFFFF",

                border: "1px solid #E9EEF4",

                "&:hover": {
                  backgroundColor: "#F8FAFC",

                  borderColor: "#DDE4EC",
                },
              }}
            >
              Sort
            </Button>
          </Stack>
        </Box>

        {/* =================================================
            STATUS FILTER
        ================================================== */}

        <Stack
          direction="row"
          spacing={0.3}
          sx={{
            flexShrink: 0,

            alignItems: "center",
          }}
        >
          <Chip
            label="All"
            sx={{
              height: 34,

              minWidth: 58,

              borderRadius: "18px",

              backgroundColor: "#0C3328",

              color: "#FFFFFF",

              fontSize: "11px",

              fontWeight: 700,
            }}
          />

          <Chip
            label="Active"
            sx={{
              height: 34,

              borderRadius: "18px",

              backgroundColor: "transparent",

              color: "#64748B",

              fontSize: "11px",

              fontWeight: 500,
            }}
          />

          <Chip
            label="Closed"
            sx={{
              height: 34,

              borderRadius: "18px",

              backgroundColor: "transparent",

              color: "#64748B",

              fontSize: "11px",

              fontWeight: 500,
            }}
          />

          <Chip
            label="Draft"
            sx={{
              height: 34,

              borderRadius: "18px",

              backgroundColor: "transparent",

              color: "#64748B",

              fontSize: "11px",

              fontWeight: 500,
            }}
          />
        </Stack>
      </Box>
      <Stack spacing={2}>
        {offerData.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  borderColor: "#CBD5E1",
                },
              }}
            >
              {/* Left Side: Avatar and Info */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: offer.avatarBg,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {offer.initials}
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#0F172B",
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {offer.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#64748B",
                      mb: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {offer.role} · {offer.salary}
                  </Typography>

                  {/* Status & Dates Row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={offer.status}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor:
                          offer.status === "Pending" ? "#FEF3C7" : "#F1F5F9",
                        color:
                          offer.status === "Pending" ? "#D97706" : "#475569",
                        borderRadius: "6px",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#94A3B8",
                        fontWeight: 500,
                      }}
                    >
                      Sent {offer.sentDate}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#D97706",
                        fontWeight: 600,
                      }}
                    >
                      Expires {offer.expireDate}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Right Side: Action Buttons */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    color: "#475569",
                    borderColor: "#CBD5E1",
                    fontWeight: 600,
                    px: 2,
                    flex: { xs: 1, sm: "none" }, // Expands on mobile, stays compact on desktop
                  }}
                >
                  Download
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendOutlinedIcon fontSize="small" />}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    bgcolor: "#0C3328",
                    color: "#fff",
                    fontWeight: 600,
                    px: 2,
                    flex: { xs: 1, sm: "none" },
                    "&:hover": {
                      bgcolor: "#08241c",
                    },
                  }}
                >
                  Resend
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
}
