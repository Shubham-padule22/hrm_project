import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  MenuItem,
  Select,
  FormHelperText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { API_BASE_URL } from "../../Config/api";
import { styled } from "@mui/material/styles";
import axios from "axios";
const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 35,
  height: 20,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#0B3126", // Theme dark green matching your image
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-track": {
      border: "6px solid #fff",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 15,
    height: 15,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"], {
      duration: 500,
    }),
  },
}));
const UniformDetails = ({
  inputStyle,
  formData,
  handleChange,
  setFormData,
  errors = {},
}) => {
  const [size, setSize] = useState([]);

  useEffect(() => {
    Promise.all([axios.get(`${API_BASE_URL}/hrm_web/employee_master/6`)])
      .then(([EmpTypeResponse]) => {
        setSize(EmpTypeResponse.data);
      })
      .catch((error) => {
        console.error("Master API Error:", error);
      });
  }, []);

  // Text fields ke liye special characters block karne ka function
  const handleSanitizedChange = (e) => {
    const { name, value } = e.target;

    if (name === "deposit") {
      // Deposit ke liye sirf numbers aur decimal point allow karega
      e.target.value = value.replace(/[^0-9.]/g, "");
    } else {
      // Baaki fields ke liye special characters block karega
      e.target.value = value.replace(/[^a-zA-Z0-9\s,-]/g, "");
    }

    handleChange(e);
  };

  // Reusable Label Component
  const FieldLabel = ({ label, required }) => (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        mb: 0.5,
        textAlign: "left",
        fontSize: ".75rem",
        color: "#45556C",
      }}
    >
      {label}
      {required && <span style={{ color: "red" }}>*</span>}
    </Typography>
  );

  // Reusable Select Field Component
  const RenderSelect = ({
    name,
    label,
    placeholder,
    options = [],
    required = false,
  }) => (
    <Grid item xs={12} sm={6} md={3} size={3}>
      <FieldLabel label={label} required={required} />
      <FormControl fullWidth error={!!errors[name]} sx={inputStyle}>
        <Select
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: "#9CA3AF" }}>{placeholder}</span>;
            }
            const selectedOption = options.find(
              (item) => String(item.value ?? item) === String(selected),
            );
            return selectedOption?.label || selectedOption || selected;
          }}
        >
          {options.map((item) => (
            <MenuItem key={item.value ?? item} value={item.value ?? item}>
              {item.label ?? item}
            </MenuItem>
          ))}
        </Select>
        {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
      </FormControl>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      {/* Top Row: Shirts & Coats */}
      <RenderSelect
        name="clg_shirt_size"
        label="Shirt Size"
        placeholder="Select Shirt Size"
        options={size}
        required
      />

      <RenderSelect
        name="shirt_qty"
        label="Shirt Qty"
        placeholder="Select Quantity"
        options={["1", "2", "3", "4", "5"]}
      />

      <RenderSelect
        name="clg_coat_size"
        label="Coat Size"
        placeholder="Select Coat Size"
        options={size}
        required
      />

      <RenderSelect
        name="coats"
        label="Coats"
        placeholder="Select Option"
        options={["Both", "Single", "None"]}
      />

      {/* Section Header: Accessories & Headwear */}
      <Grid item xs={12} sx={{ mt: 1 }} size={12}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.95rem" }}
          >
            🎓 Accessories & Headwear
          </Typography>
        </Box>
      </Grid>

      {/* Middle Row: Epaulettes, Balmoral, Contract */}
      <RenderSelect
        name="epaulettes"
        label="Epaulettes"
        placeholder="Select Option"
        options={["Both", "Left", "Right", "None"]}
      />

      <RenderSelect
        name="balmoral_size"
        label="Balmoral Size"
        placeholder="Select Size"
        options={size}
      />

      <RenderSelect
        name="balmoral_qty"
        label="Balmoral Qty"
        placeholder="Select Quantity"
        options={["1", "2", "3", "4", "5"]}
      />

      <RenderSelect
        name="contract"
        label="Contract"
        placeholder="Select Contract Type"
        options={[ "Full Time", "Part Time"]}
      />

      {/* Bottom Row: Deposit, Uniform Return, Notes */}
      <Grid item xs={12} sm={6} md={3} size={3}>
        <FieldLabel label="Deposit" />
        <TextField
          fullWidth
          name="deposit"
          value={formData.deposit ?? ""}
          onChange={handleSanitizedChange}
          placeholder="0.00"
          sx={inputStyle}
          error={!!errors.deposit}
          helperText={errors.deposit}
        />
        <Typography
          variant="caption"
          sx={{ color: "#6B7280", mt: 0.5, display: "block" }}
        >
          Refundable
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3} size={3}>
        <FieldLabel label="Uniform Return" />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.3,
            borderRadius: 2,
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          <FormControlLabel
            control={
              <IOSSwitch
                sx={{ mr: 1 }}
                name="uniform_return"
                checked={Boolean(formData.uniform_return)}
                onChange={(e) => {
                  handleChange({
                    target: {
                      name: "uniform_return",
                      value: e.target.checked,
                      type: "checkbox",
                      checked: e.target.checked,
                    },
                  });
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{ color: "#334155", fontWeight: 500, fontSize: "0.85rem" }}
              >
                {formData.uniform_return ? "Yes, Returned" : "No"}
              </Typography>
            }
          />
        </Box>
      </Grid>

      <Grid item xs={12} sm={12} md={6} size={6}>
        <FieldLabel label="Notes" />
        <TextField
          fullWidth
          name="notes"
          value={formData.notes ?? ""}
          onChange={handleSanitizedChange}
          placeholder="Condition, missing items, handover details"
          sx={inputStyle}
          error={!!errors.notes}
          helperText={errors.notes}
        />
      </Grid>
    </Grid>
  );
};

export default UniformDetails;
