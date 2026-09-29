import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Container,
} from "@mui/material";

const BankDetails = ({ inputStyle, formData, handleChange, errors }) => {
  const handleSanitizedChange = (e) => {
    const { name, value } = e.target;

    if (name === "routing_number") {
      // Sort code ke liye sirf numbers aur max 6 digits allow karega
      e.target.value = value.replace(/[^0-9]/g, "").slice(0, 6);
    } else {
      // Baaki fields ke liye special characters block karega
      e.target.value = value.replace(/[^a-zA-Z0-9\s,-]/g, "");
    }

    handleChange(e);
  };

  return (
    <Grid container spacing={2}>
      {/* Main Personal Info */}
      <Grid item xs={12} sm={12} size={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            textAlign: "left",
            fontSize: ".7rem",
            color: "#45556C",
          }}
        >
          Bank Name
          <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          name="bank_name"
          value={formData.bank_name}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="Enter Bank Name"
          error={!!errors.bank_name}
          helperText={errors.bank_name}
        />
      </Grid>

      <Grid item xs={12} sm={6} size={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            textAlign: "left",
            fontSize: ".7rem",
            color: "#45556C",
          }}
        >
          Bank Address
          <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          name="bank_address"
          value={formData.bank_address}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="Enter Bank Address"
          error={!!errors.bank_address}
          helperText={errors.bank_address}
        />
      </Grid>

      <Grid item xs={12} sm={6} size={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            textAlign: "left",
            fontSize: ".7rem",
            color: "#45556C",
          }}
        >
          Account Number
          <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          name="account_number"
          value={formData.account_number}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="Enter Account Number"
          error={!!errors.account_number}
          helperText={errors.account_number}
        />
      </Grid>
      <Grid item xs={12} sm={6} size={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            textAlign: "left",
            fontSize: ".7rem",
            color: "#45556C",
          }}
        >
          Account name
          <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          name="account_name"
          value={formData.account_name}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="Enter Account Name"
          error={!!errors.account_name}
          helperText={errors.account_name}
        />
      </Grid>

      <Grid item xs={12} sm={6} size={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            textAlign: "left",
            fontSize: ".7rem",
            color: "#45556C",
          }}
        >
          Bank Sort Code 6 Digit
          <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          name="routing_number"
          value={formData.routing_number}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="e.g. 071000"
          error={!!errors.routing_number}
          helperText={errors.routing_number}
        />
      </Grid>
    </Grid>
  );
};

export default BankDetails;
