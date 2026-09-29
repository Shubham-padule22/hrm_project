import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Container,
  FormControl,
  OutlinedInput,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { API_BASE_URL } from "../../Config/api";
import axios from "axios";

const MedicalDetails = ({ inputStyle, formData, handleChange, errors }) => {
  const [empType, setEmpType] = useState([]);

  useEffect(() => {
    Promise.all([axios.get(`${API_BASE_URL}/hrm_web/employee_master/5`)])
      .then(([EmpTypeResponse]) => {
        setEmpType(EmpTypeResponse.data);
      })
      .catch((error) => {
        console.error("Master API Error:", error);
      });
  }, []);

  // Medical fields ke liye allowed characters (Alphabets, Numbers, Spaces, aur common symbols like , . - /)
  const handleSanitizedChange = (e) => {
    const { name, value } = e.target;

    const medicalTextFields = [
      "clg_medical_condition",
      "clg_allergies",
      "clg_med_specialization",
      "clg_medical_insurance_provider",
    ];

    if (medicalTextFields.includes(name)) {
      // Letters, numbers, spaces, aur common punctuation/symbols allow karega
      e.target.value = value.replace(/[^a-zA-Z0-9\s,.\-/]/g, "");
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
          Blood Type <span style={{ color: "red" }}>*</span>
        </Typography>
        <FormControl fullWidth error={!!errors.clg_blood_type} sx={inputStyle}>
          <Select
            name="clg_blood_type"
            value={formData.clg_blood_type ?? ""}
            onChange={handleChange}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#9CA3AF" }}>Select Blood Type</span>
                );
              }

              const selectedBloodType = empType?.find(
                (item) => String(item.label) === String(selected),
              );

              return selectedBloodType?.label || "";
            }}
          >
            {empType?.map((item) => (
              <MenuItem key={item.label} value={item.label}>
                {item.label}
              </MenuItem>
            ))}
          </Select>

          {errors.clg_blood_type && (
            <FormHelperText>{errors.clg_blood_type}</FormHelperText>
          )}
        </FormControl>
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
          Medical Conditions
          {/* <span style={{ color: "red" }}>*</span> */}
        </Typography>

        <TextField
          fullWidth
          name="clg_medical_condition"
          value={formData.clg_medical_condition}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="None / describe"
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
          Allergies
          {/* <span style={{ color: "red" }}>*</span> */}
        </Typography>

        <TextField
          fullWidth
          name="clg_allergies"
          value={formData.clg_allergies}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="None / describe"
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
          {/* <span style={{ color: "red" }}>*</span> */}
        </Typography>

        <TextField
          fullWidth
          name="clg_med_specialization"
          placeholder="None / describe"
          value={formData.clg_med_specialization}
          onChange={handleSanitizedChange}
          sx={inputStyle}
        />
      </Grid>
      <Grid item xs={12} sm={6} size={12}>
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
          Medical Insurance Provider
          {/* <span style={{ color: "red" }}>*</span> */}
        </Typography>

        <TextField
          fullWidth
          name="clg_medical_insurance_provider"
          placeholder="Blue Cross Blue Shield"
          value={formData.clg_medical_insurance_provider}
          onChange={handleSanitizedChange}
          sx={inputStyle}
        />
      </Grid>
    </Grid>
  );
};

export default MedicalDetails;
