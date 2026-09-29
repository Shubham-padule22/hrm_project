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
  MenuItem,
  FormControl,
  OutlinedInput,
  Select,
  FormHelperText,
} from "@mui/material";
import { API_BASE_URL } from "../../Config/api";
import axios from "axios";

const SalaryDetails = ({ inputStyle, formData, handleChange, errors }) => {
  const [empType, setEmpType] = useState([]);
  const [shiftType, setShiftType] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}/hrm_web/employee_master/4`),
      axios.get(`${API_BASE_URL}/hrm_web/employee_master/7`),
    ])
      .then(([EmpTypeResponse, ShiftTypeResponse]) => {
        setEmpType(EmpTypeResponse.data);
        setShiftType(ShiftTypeResponse.data);
      })
      .catch((error) => {
        console.error("Master API Error:", error);
      });
  }, []);

  // Special characters block karne ke liye handler
  const handleSanitizedChange = (e) => {
    const { name, value } = e.target;

    if (name === "clg_insurance_number") {
      // National Insurance Number ke liye special characters block (sirf alphabets, numbers, spaces, aur hyphen allow)
      e.target.value = value.replace(/[^a-zA-Z0-9\s-]/g, "");
    }

    handleChange(e);
  };

  return (
    <Grid container spacing={2}>
      {/* Main Personal Info */}
      <Grid item xs={12} sm={12} size={12}>
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
          Employment Type <span style={{ color: "red" }}>*</span>
        </Typography>

        <FormControl
          fullWidth
          error={!!errors.clg_employment_type}
          sx={inputStyle}
        >
          <Select
            name="clg_employment_type"
            value={formData.clg_employment_type ?? ""}
            onChange={handleChange}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#9CA3AF" }}>
                    Select Employment Type
                  </span>
                );
              }

              const selectedEmploymentType = empType?.find(
                (item) => String(item.value) === String(selected),
              );

              return selectedEmploymentType?.label || "";
            }}
          >
            {empType?.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>

          {errors.clg_employment_type && (
            <FormHelperText>{errors.clg_employment_type}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Pay type <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="clg_pay_type"
                    value={formData.clg_pay_type}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='hrs'
                    error={!!errors.clg_pay_type}
                    helperText={errors.clg_pay_type}
                />
            </Grid> */}

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
          Shift Type <span style={{ color: "red" }}>*</span>
        </Typography>

        <FormControl fullWidth error={!!errors.clg_shift_type} sx={inputStyle}>
          <Select
            name="clg_shift_type"
            value={formData.clg_shift_type ?? ""}
            onChange={handleChange}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#9CA3AF" }}>Select Shift Type</span>
                );
              }

              const selectedEmploymentType = shiftType?.find(
                (item) => String(item.label) === String(selected),
              );

              return selectedEmploymentType?.label || "";
            }}
          >
            {shiftType?.map((item) => (
              <MenuItem key={item.label} value={item.label}>
                {item.label}
              </MenuItem>
            ))}
          </Select>

          {errors.clg_shift_type && (
            <FormHelperText>{errors.clg_shift_type}</FormHelperText>
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
          National Insurance Number
          {/* <span style={{ color: "red" }}>*</span> */}
        </Typography>

        <TextField
          fullWidth
          name="clg_insurance_number"
          value={formData.clg_insurance_number}
          onChange={handleSanitizedChange}
          sx={inputStyle}
          placeholder="HCPC-PA01234"
        />
      </Grid>
    </Grid>
  );
};

export default SalaryDetails;
