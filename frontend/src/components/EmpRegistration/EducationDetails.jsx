import React, { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  stepConnectorClasses,
  styled,
  StepConnector,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { motion, AnimatePresence } from "framer-motion";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

const EducationDetails = ({ inputStyle, formData, handleChange, errors }) => {
  const handleSanitizedChange = (e) => {
    // Sirf alphabets, numbers, space, comma (,) aur hyphen (-) allow karega
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s,-]/g, "");
    handleChange(e);
  };

  return (
    <Grid container spacing={2}>
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
          Highest Qualification <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          placeholder="BSc Paramedic Science"
          name="clg_qualification"
          value={formData.clg_qualification}
          onChange={handleSanitizedChange}
          error={!!errors.clg_qualification}
          helperText={errors.clg_qualification}
          sx={inputStyle}
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
          University / College <span style={{ color: "red" }}>*</span>
        </Typography>

        <TextField
          fullWidth
          placeholder="University of Hertfordshire"
          name="clg_university"
          value={formData.clg_university}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          error={!!errors.clg_university}
          helperText={errors.clg_university}
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
          Graduation Year
        </Typography>

        <TextField
          fullWidth
          placeholder="2017"
          type="text"
          name="clg_graduation_year"
          value={formData.clg_graduation_year}
          // onChange={handleSanitizedChange}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^0-9]/g, "")
              .slice(0, 4);

            handleSanitizedChange({
              target: {
                name: "clg_graduation_year",
                value,
              },
            });
          }}
          error={!!errors.graduationYear}
          helperText={errors.graduationYear}
          sx={inputStyle}
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
          Certifications
        </Typography>

        <TextField
          fullWidth
          name="clg_certification"
          value={formData.clg_certification}
          onChange={handleSanitizedChange}
          error={!!errors.certifications}
          helperText={errors.certifications}
          sx={inputStyle}
          placeholder="FPHC, ALS, PHTLS"
        />
      </Grid>
      <Grid item xs={12} size={12}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
            mb: 1,
          }}
        >
          <WorkOutlineOutlinedIcon
            sx={{
              color: "#0a3d31",
              fontSize: 22,
            }}
          />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: ".9rem",
              color: "#0F172B",
            }}
          >
            Work Experience
          </Typography>
        </Box>
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
          Current Employer
        </Typography>

        <TextField
          fullWidth
          name="clg_current_employer"
          value={formData.clg_current_employer}
          onChange={handleSanitizedChange}
          error={!!errors.currentEmployer}
          helperText={errors.currentEmployer}
          sx={inputStyle}
          placeholder="London Ambulance Service"
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
          Years Experience
        </Typography>

        <TextField
          fullWidth
          name="clg_total_experience"
          value={formData.clg_total_experience}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^0-9]/g, "")
              .slice(0, 2);

            handleSanitizedChange({
              target: {
                name: "clg_total_experience",
                value,
              },
            });
          }}
          error={!!errors.yearsExperience}
          helperText={errors.yearsExperience}
          sx={inputStyle}
          placeholder="6"
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
          License Number
        </Typography>

        <TextField
          fullWidth
          name="clg_license_number"
          value={formData.clg_license_number}
          onChange={handleSanitizedChange}
          error={!!errors.licenseNumber}
          helperText={errors.licenseNumber}
          sx={inputStyle}
          placeholder="HCPC-PA01234"
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
          Specialisation
        </Typography>

        <TextField
          fullWidth
          placeholder="Critical Care Transport"
          name="clg_specialization"
          value={formData.clg_specialization}
          onChange={handleSanitizedChange}
          error={!!errors.specialisation}
          helperText={errors.specialisation}
          sx={inputStyle}
        />
      </Grid>
    </Grid>
  );
};

export default EducationDetails;
