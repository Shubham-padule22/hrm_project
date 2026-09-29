import React from "react";
import { Box, Typography } from "@mui/material";
import spero from "../../assets/speroblk.png";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        py: 0,
        bgcolor: "#E2E2E2",
        borderTop: "1px solid #E2E8F0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        zIndex: 1200,
      }}
    >
      <Typography
        sx={{
          color: "#64748B",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        Powered By
      </Typography>

      <Box
        component="img"
        src={spero}
        alt="Spero Logo"
        sx={{
          height: 30,
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
    </Box>
  );
};

export default Footer;