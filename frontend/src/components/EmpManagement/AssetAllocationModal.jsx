import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Autocomplete,
  Divider,
  Alert,
  Collapse,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { motion } from "framer-motion";
import axiosInstance from "../../Config/axiosInstance";

/* =========================================================
   SCROLLBAR
========================================================= */
const macScrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0,0,0,0.15) transparent",
};

/* =========================================================
   INPUT STYLE
========================================================= */
const modalInputStyle = {
  "& .MuiOutlinedInput-root": {
    minHeight: 38,
    borderRadius: "8px",
    background: "#FFFFFF",
    fontSize: 11.5,
    "& fieldset": { 
      borderColor: "#E3E8EF", 
      transition: "border-color 0.2s ease" 
    },
    "&:hover fieldset": { borderColor: "#D5DBE3" },
    "&.Mui-focused fieldset": { 
      borderColor: "#073F35", // Dark green focus[cite: 5]
      borderWidth: "1px" // 1px match[cite: 5]
    }, 
    "&.Mui-error fieldset": { borderColor: "#EF3340" },
  },
  "& .MuiInputBase-input": { fontSize: 11.5, padding: "9px 12px" },
  "& .MuiInputBase-input::placeholder": { color: "#8E96A3", opacity: 1 },
  "& .Mui-disabled": {
    WebkitTextFillColor: "#8A929B !important",
    background: "#F9FAFB",
  },
  "& .MuiFormHelperText-root": {
    fontSize: 9.5,
    marginLeft: 0,
    marginTop: 3,
  },
  // Custom chevron styling
  "& .MuiSelect-icon": {
    color: "#A0AAB5",
    right: 8,
    transition: "transform 0.2s ease",
  },
  // Gray out placeholder text
  "& .MuiSelect-select .MuiTypography-root": {
    color: "#8E96A3",
  },
};

/* =========================================================
   DROPDOWN MENU STYLE
========================================================= */
const dropdownMenuProps = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  PaperProps: {
    sx: {
      mt: 0.5, 
      borderRadius: "8px", 
      boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
      border: "1px solid #E3E8EF",
      "& .MuiList-root": {
        p: 1,
      },
      "& .MuiMenuItem-root": {
        fontSize: 11.5,
        fontWeight: 500,
        my: 0.3,
        borderRadius: "24px", // Perfect pill shape[cite: 5]
        px: 2,
        py: 1.1,
        color: "#46556D",
        transition: "all 0.1s ease",
        "&:hover": {
          backgroundColor: "#F5F7F9",
        },
        "&.Mui-selected": {
          backgroundColor: "#073F35 !important", // Dark green background[cite: 5]
          color: "#FFFFFF",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#073F35 !important",
          },
        },
      },
    },
  },
};

const autocompletePaperStyle = {
  mt: 0.5,
  borderRadius: "8px",
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
  border: "1px solid #E3E8EF",
  "& .MuiAutocomplete-listbox": {
    padding: "8px",
    "& .MuiAutocomplete-option": {
      minHeight: "auto",
      margin: "4px 0",
      borderRadius: "24px", // Perfect pill shape[cite: 5]
      padding: "8px 16px",
      '&[aria-selected="true"]': {
        backgroundColor: "#073F35 !important",
      },
      '&[aria-selected="true"].Mui-focused': {
        backgroundColor: "#073F35 !important",
      },
      "&:hover": {
         backgroundColor: "#F5F7F9",
      }
    }
  }
};


const defaultFormData = {
  assetType: "",
  assetName: "",
  assetTag: "",
  serialNumber: "",
  brand: "",
  modelName: "",
  purchaseCost: "",
  condition: "", // Changed to empty to allow placeholder to show
  assignTo: null,
  existingAsset: null,
  issueDate: "",
  expectedReturnDate: "",
  notes: "",
};

const FieldLabel = ({ children, required = false }) => (
  <Typography
    sx={{ fontSize: 11, fontWeight: 600, color: "#46556D", mb: 0.55 }}
  >
    {children} {required && <span style={{ color: "#EF3340" }}>*</span>}
  </Typography>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

/* =========================================================
   MAIN MODAL
========================================================= */
export default function AssetAllocationModal({
  open,
  mode = "add", // "add", "edit", "view"
  allocation = null,
  employeeOptions = [],
  fetchEmployeeOptions,
  onClose,
  onSuccess,
}) {
  const isEdit = mode === "edit";
  const isView = mode === "view";
  // Making fields read only solely based on view mode (Editable on edit)
  const isReadOnly = isView;

  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertState, setAlertState] = useState({ type: "", message: "" });
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [creationMode, setCreationMode] = useState("new");
  const [assetOptions, setAssetOptions] = useState([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [tagStatus, setTagStatus] = useState("idle");

  const [editAssetId, setEditAssetId] = useState(null);

  const employeeSearchDebounceRef = useRef(null);
  const assetSearchDebounceRef = useRef(null);
  const tagCheckDebounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setAlertState({ type: "", message: "" });
    setCreationMode("new");
    setTagStatus("idle");

    if ((isEdit || isView) && allocation) {
      const asset = allocation.asset || {};
      const colleague = allocation.colleague || {};
      const condition = asset.condition || allocation.condition || "good";

      setEditAssetId(asset.id || allocation.asset_id || null);

      setFormData({
        ...defaultFormData,
        assetType: asset.category || allocation.category || "",
        assetName: asset.asset_name || allocation.asset_name || "",
        assetTag: asset.asset_tag || allocation.asset_tag || "",
        serialNumber: asset.serial_number || allocation.serial_number || "",
        brand: asset.brand || "",
        modelName: asset.model_name || "",
        purchaseCost: asset.purchase_cost || "",
        condition,
        assignTo: colleague?.id
          ? {
              id: colleague.id,
              refId: colleague.clg_ref_id,
              name: colleague.name,
            }
          : allocation.employee_id
            ? {
                id: allocation.employee_id,
                refId: allocation.employee_ref_id,
                name: allocation.employee_name,
              }
            : null,
        issueDate: asset.purchase_date || "",
        expectedReturnDate: allocation.expected_return_date || "",
        notes: allocation.remarks || "",
      });
    } else {
      setEditAssetId(null);
      setFormData({ ...defaultFormData });
    }
  }, [open, isEdit, isView, allocation]);

  const handleChange = (field) => (event) => {
    if (isReadOnly) return;
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (field === "assetTag" && (!isEdit || creationMode === "new")) {
      setTagStatus("idle");
      if (tagCheckDebounceRef.current)
        clearTimeout(tagCheckDebounceRef.current);

      if (value) {
        tagCheckDebounceRef.current = setTimeout(async () => {
          setTagStatus("checking");
          try {
            const response = await axiosInstance.post(
              "/hrm_web/assets/validate-tag/",
              { asset_tag: value },
            );
            const available =
              response.data?.available ?? response.data?.is_available;
            setTagStatus(available === false ? "taken" : "available");
          } catch (error) {
            setTagStatus("idle");
          }
        }, 450);
      }
    }
  };

  const handleEmployeeChange = (event, value) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, assignTo: value }));
    setErrors((prev) => ({ ...prev, assignTo: undefined }));
  };

  const handleEmployeeInputChange = (event, value, reason) => {
    if (reason !== "input" || !fetchEmployeeOptions || isReadOnly) return;
    if (employeeSearchDebounceRef.current)
      clearTimeout(employeeSearchDebounceRef.current);

    setEmployeeLoading(true);
    employeeSearchDebounceRef.current = setTimeout(async () => {
      await fetchEmployeeOptions(value);
      setEmployeeLoading(false);
    }, 400);
  };

  const fetchAssetOptions = async (term = "") => {
    setAssetLoading(true);
    try {
      const response = await axiosInstance.get(
        `/hrm_web/assets/?search=${encodeURIComponent(term)}`,
      );
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setAssetOptions(list);
    } catch (error) {
      setAssetOptions([]);
    } finally {
      setAssetLoading(false);
    }
  };

  const handleExistingAssetChange = (event, value) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, existingAsset: value }));
    setErrors((prev) => ({ ...prev, existingAsset: undefined }));
  };

  const handleExistingAssetInputChange = (event, value, reason) => {
    if (reason !== "input" || isReadOnly) return;
    if (assetSearchDebounceRef.current)
      clearTimeout(assetSearchDebounceRef.current);
    assetSearchDebounceRef.current = setTimeout(() => {
      fetchAssetOptions(value);
    }, 400);
  };

  useEffect(() => {
    if (open && creationMode === "existing" && !isEdit && !isView)
      fetchAssetOptions();
  }, [open, creationMode, isEdit, isView]);

  const validate = () => {
    const nextErrors = {};
    if (!isEdit) {
      if (creationMode === "new") {
        if (!formData.assetType) nextErrors.assetType = "Required";
        if (!formData.assetName) nextErrors.assetName = "Required";
        if (!formData.assetTag) nextErrors.assetTag = "Required";
        if (!formData.serialNumber) nextErrors.serialNumber = "Required";
        if (!formData.brand) nextErrors.brand = "Required";
        if (!formData.modelName) nextErrors.modelName = "Required";
        if (!formData.issueDate) nextErrors.issueDate = "Required";
        if (tagStatus === "taken") nextErrors.assetTag = "Tag already in use";
      } else {
        const assetId =
          formData.existingAsset?.id || formData.existingAsset?.asset_id;
        if (!formData.existingAsset || !assetId) {
          nextErrors.existingAsset = "Required & must have a valid ID";
        }
      }
      if (!formData.assignTo) nextErrors.assignTo = "Required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isView) return;
    setAlertState({ type: "", message: "" });

    if (!validate()) {
      return setAlertState({
        type: "error",
        message: "Please fill all required fields.",
      });
    }

    setSaving(true);
    try {
      if (!isEdit) {
        if (creationMode === "new") {
          const payload = {
            colleague_id: formData.assignTo.id,
            expected_return_date: formData.expectedReturnDate || undefined,
            remarks: formData.notes || "",
            new_asset: {
              asset_tag: formData.assetTag,
              asset_name: formData.assetName,
              category: formData.assetType,
              brand: formData.brand,
              model_name: formData.modelName,
              serial_number: formData.serialNumber,
              purchase_date: formData.issueDate,
              purchase_cost: formData.purchaseCost,
              condition: formData.condition || "new",
            },
          };
          await axiosInstance.post("/hrm_web/asset-allocations/", payload);
        } else {
          const selectedAssetId =
            formData.existingAsset?.id || formData.existingAsset?.asset_id;

          if (!selectedAssetId) {
            setAlertState({
              type: "error",
              message: "Selected asset is missing a valid ID.",
            });
            setSaving(false);
            return;
          }

          const payload = {
            colleague_id: formData.assignTo.id,
            asset_id: selectedAssetId,
            expected_return_date: formData.expectedReturnDate || undefined,
            condition_at_allocation: formData.condition || "good",
            remarks: formData.notes || "",
          };
          await axiosInstance.post("/hrm_web/asset-allocations/", payload);
        }
        setAlertState({
          type: "success",
          message: "Asset issued successfully!",
        });
      } else {
        const allocationId = allocation?.id || allocation?.allocation_id;
        if (!allocationId) throw new Error("Allocation ID is missing.");

        // First update allocation
        await axiosInstance.put(`/hrm_web/asset-allocations/${allocationId}/`, {
          remarks: formData.notes || "",
          expected_return_date: formData.expectedReturnDate || null,
        });

        // Since you wanted all fields editable in edit mode,
        // passing edited master asset values directly back to API via PATCH
        if (editAssetId) {
          await axiosInstance.patch(`/hrm_web/assets/${editAssetId}/`, {
            category: formData.assetType,
            asset_name: formData.assetName,
            asset_tag: formData.assetTag,
            serial_number: formData.serialNumber,
            brand: formData.brand,
            model_name: formData.modelName,
            purchase_cost: formData.purchaseCost || null,
            condition: formData.condition,
            ...(formData.issueDate && { purchase_date: formData.issueDate }),
          });
        }

        setAlertState({
          type: "success",
          message: "Asset updated successfully!",
        });
      }

      setTimeout(() => onSuccess?.(), 500);
    } catch (error) {
      setAlertState({
        type: "error",
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.95, y: 15 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 15 },
        transition: { duration: 0.25, ease: "easeOut" },
        sx: {
          borderRadius: "14px",
          width: "calc(100% - 32px)",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 18px 45px rgba(31, 41, 55, 0.16)",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F0F2F4",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#18202A" }}>
            {isView
              ? "View Asset Allocation"
              : isEdit
                ? "Edit Asset Allocation"
                : "Issue Asset"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={saving}
          sx={{ color: "#8A929B", "&:hover": { background: "#F5F7F9" } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 2,
          maxHeight: "74vh",
          overflowY: "auto",
          ...macScrollbarStyle,
        }}
      >
        <Collapse in={!!alertState.message}>
          <Alert
            severity={alertState.type || "info"}
            sx={{ mb: 2, fontSize: 11, borderRadius: "8px" }}
          >
            {alertState.message}
          </Alert>
        </Collapse>

        <Box
          component={motion.form}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          id="asset-allocation-form"
          onSubmit={handleSubmit}
        >
          {!isEdit && !isView && (
            <Box component={motion.div} variants={itemVariants} sx={{ mb: 2 }}>
              <FieldLabel>Asset Source</FieldLabel>
              <ToggleButtonGroup
                exclusive
                value={creationMode}
                onChange={(e, val) => {
                  if (val) {
                    setCreationMode(val);
                    setErrors({});
                  }
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    fontSize: 10.5,
                    textTransform: "none",
                    px: 1.5,
                    py: 0.55,
                    border: "1px solid #E4E7EB",
                    "&.Mui-selected": {
                      background: "#073F35",
                      color: "#fff",
                      "&:hover": { background: "#073F35" },
                    },
                  },
                }}
              >
                <ToggleButton value="new">Create New Asset</ToggleButton>
                <ToggleButton value="existing">Allocate Existing</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          <Box component={motion.div} variants={itemVariants}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: "#7A8593",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {(!isEdit && !isView && creationMode === "new") ||
              isEdit ||
              isView
                ? "Asset Details"
                : "Select Asset"}
            </Typography>
          </Box>

          {(!isEdit && !isView && creationMode === "new") ||
          isEdit ||
          isView ? (
            <>
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box>
                  <FieldLabel required={!isEdit}>Asset Type</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={formData.assetType}
                    onChange={handleChange("assetType")}
                    disabled={isReadOnly}
                    error={!!errors.assetType}
                    sx={modalInputStyle}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: dropdownMenuProps,
                      IconComponent: KeyboardArrowDownRoundedIcon,
                      renderValue: (selected) => {
                        if (!selected) return <Typography>Select</Typography>;
                        return selected.charAt(0).toUpperCase() + selected.slice(1);
                      }
                    }}
                  >
                    <MenuItem value="" disabled sx={{ display: 'none' }}>
                      Select
                    </MenuItem>
                    <MenuItem value="laptop">Laptop</MenuItem>
                    <MenuItem value="mobile">Mobile</MenuItem>
                    <MenuItem value="uniform">Uniform</MenuItem>
                    <MenuItem value="vehicle">Vehicle</MenuItem>
                  </TextField>
                </Box>
                <Box>
                  <FieldLabel required={!isEdit}>Asset Name</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. MacBook Pro 14"
                    value={formData.assetName}
                    onChange={handleChange("assetName")}
                    disabled={isReadOnly}
                    error={!!errors.assetName}
                    sx={modalInputStyle}
                  />
                </Box>
              </Box>

              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Box>
                  <FieldLabel required={!isEdit}>Asset Tag</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="AST-1001"
                    value={formData.assetTag}
                    onChange={handleChange("assetTag")}
                    disabled={isReadOnly}
                    error={!!errors.assetTag || tagStatus === "taken"}
                    helperText={
                      errors.assetTag ||
                      (tagStatus === "checking"
                        ? "Checking..."
                        : tagStatus === "taken"
                          ? "Tag taken"
                          : tagStatus === "available" && !isEdit
                            ? "Tag available"
                            : "")
                    }
                    FormHelperTextProps={{
                      sx: {
                        color:
                          tagStatus === "available" ? "#15956E" : undefined,
                        m: 0,
                        mt: 0.5,
                      },
                    }}
                    sx={modalInputStyle}
                  />
                </Box>
                <Box>
                  <FieldLabel required={!isEdit}>Serial Number</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Manufacturer SN"
                    value={formData.serialNumber}
                    onChange={handleChange("serialNumber")}
                    disabled={isReadOnly}
                    error={!!errors.serialNumber}
                    sx={modalInputStyle}
                  />
                </Box>
              </Box>

              <Box component={motion.div} variants={itemVariants}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#8A929B",
                    mb: 1.5,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Specifications & Cost
                </Typography>
              </Box>
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Box>
                  <FieldLabel required={!isEdit}>Brand</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Dell, Apple"
                    value={formData.brand}
                    onChange={handleChange("brand")}
                    disabled={isReadOnly}
                    sx={modalInputStyle}
                  />
                </Box>
                <Box>
                  <FieldLabel required={!isEdit}>Model</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Latitude 5420"
                    value={formData.modelName}
                    onChange={handleChange("modelName")}
                    disabled={isReadOnly}
                    sx={modalInputStyle}
                  />
                </Box>
                <Box>
                  <FieldLabel required={!isEdit}>Purchase Cost</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="65000"
                    value={formData.purchaseCost}
                    onChange={handleChange("purchaseCost")}
                    disabled={isReadOnly}
                    sx={modalInputStyle}
                  />
                </Box>
              </Box>
            </>
          ) : (
            <Box component={motion.div} variants={itemVariants} sx={{ mb: 2 }}>
              <FieldLabel required>Available Asset</FieldLabel>
              <Autocomplete
                size="small"
                options={assetOptions}
                value={formData.existingAsset}
                onChange={handleExistingAssetChange}
                onInputChange={handleExistingAssetInputChange}
                disabled={isReadOnly}
                PaperComponent={({ children }) => (
                  <Box sx={autocompletePaperStyle}>{children}</Box>
                )}
                getOptionDisabled={(option) => option.status !== "available"}
                getOptionLabel={(option) =>
                  option?.asset_name
                    ? `${option.asset_name} (${
                        option.asset_tag || option.serial_number || ""
                      })`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id ||
                  option?.asset_id === value?.asset_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search available assets..."
                    error={!!errors.existingAsset}
                    helperText={errors.existingAsset}
                    sx={modalInputStyle}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {assetLoading ? (
                            <CircularProgress size={12} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps?.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option, { selected }) => {
                  const isAvailable = option.status === "available";
                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        ...props.sx,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        boxSizing: "border-box",
                        borderBottom: "none", 
                        opacity: isAvailable ? 1 : 0.6,
                        cursor: isAvailable ? "pointer" : "not-allowed",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: selected 
                                ? "#FFFFFF" 
                                : isAvailable 
                                ? "#1A2634" 
                                : "#AEB4BA",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {option?.asset_name || "Unknown Asset"}
                          </Typography>
                          {option?.category && (
                            <Typography
                              component="span"
                              sx={{
                                flexShrink: 0,
                                fontSize: 9,
                                fontWeight: 600,
                                color: selected 
                                  ? "#073F35" 
                                  : isAvailable 
                                  ? "#6B7280" 
                                  : "#B8BDC3",
                                backgroundColor: selected ? "#FFFFFF" : "#F3F4F6",
                                px: 0.8,
                                py: 0.25,
                                borderRadius: "4px",
                                textTransform: "capitalize",
                              }}
                            >
                              {option.category}
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 9.5,
                            color: selected 
                              ? "rgba(255,255,255,0.8)" 
                              : isAvailable 
                              ? "#8A929B" 
                              : "#C1C6CB",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Tag: {option?.asset_tag || "N/A"} • SN:{" "}
                          {option?.serial_number || "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 95,
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          ml: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 8.5,
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            color: selected 
                              ? "#FFFFFF" 
                              : isAvailable 
                              ? "#047857" 
                              : "#E58A8A",
                            backgroundColor: selected 
                              ? "rgba(255,255,255,0.2)" 
                              : isAvailable
                              ? "#D1FAE5"
                              : "#FEE8E8",
                            px: 1.3,
                            py: 0.55,
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 70,
                          }}
                        >
                          {option.status || "UNKNOWN"}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
            </Box>
          )}

          <Divider sx={{ mb: 2, borderColor: "#F0F2F4" }} />

          <Box component={motion.div} variants={itemVariants}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: "#7A8593",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Assignment Details
            </Typography>
          </Box>

          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box>
              <FieldLabel required={!isEdit}>Assign To Employee</FieldLabel>
              <Autocomplete
                size="small"
                options={employeeOptions}
                value={formData.assignTo}
                onChange={handleEmployeeChange}
                onInputChange={handleEmployeeInputChange}
                disabled={isReadOnly}
                PaperComponent={({ children }) => (
                  <Box sx={autocompletePaperStyle}>{children}</Box>
                )}
                getOptionLabel={(option) =>
                  option?.name
                    ? `${option.name} (${option.refId || option.id})`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search employee..."
                    error={!!errors.assignTo}
                    sx={modalInputStyle}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {employeeLoading ? (
                            <CircularProgress size={12} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps?.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option, { selected }) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start !important",
                      py: "6px !important",
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontSize: 10.5, 
                        fontWeight: 700,
                        color: selected ? "#FFFFFF" : "inherit"
                      }}
                    >
                      {option?.name}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: 9, 
                        color: selected ? "rgba(255,255,255,0.7)" : "#8A929B" 
                      }}
                    >
                      {option?.refId || option?.id}
                    </Typography>
                  </Box>
                )}
              />
            </Box>

            <Box>
              <FieldLabel>Condition at Allocation</FieldLabel>
              <TextField
                select
                fullWidth
                size="small"
                value={formData.condition}
                onChange={handleChange("condition")}
                disabled={isReadOnly}
                sx={modalInputStyle}
                SelectProps={{
                  displayEmpty: true,
                  MenuProps: dropdownMenuProps,
                  IconComponent: KeyboardArrowDownRoundedIcon,
                  renderValue: (selected) => {
                    if (!selected) return <Typography>Select</Typography>;
                    return selected.charAt(0).toUpperCase() + selected.slice(1);
                  }
                }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  Select
                </MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="damaged">Damaged</MenuItem>
              </TextField>
            </Box>

            {(!isEdit && !isView && creationMode === "new") ||
            isEdit ||
            isView ? (
              <Box>
                <FieldLabel required={!isEdit}>Issue Date</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.issueDate}
                  onChange={handleChange("issueDate")}
                  disabled={isReadOnly}
                  error={!!errors.issueDate}
                  sx={modalInputStyle}
                />
              </Box>
            ) : null}

            <Box
              sx={{
                gridColumn:
                  isEdit || isView || creationMode === "existing"
                    ? "auto"
                    : "1 / -1",
              }}
            >
              <FieldLabel>Expected Return Date</FieldLabel>
              <TextField
                fullWidth
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.expectedReturnDate}
                onChange={handleChange("expectedReturnDate")}
                disabled={isReadOnly}
                sx={modalInputStyle}
              />
            </Box>
          </Box>

          <Box component={motion.div} variants={itemVariants} sx={{ mt: 3 }}>
            <FieldLabel>Remarks / Additional Notes</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Type any additional context here..."
              value={formData.notes}
              onChange={handleChange("notes")}
              disabled={isReadOnly}
              sx={{
                ...modalInputStyle,
                "& .MuiOutlinedInput-root": {
                  minHeight: "auto",
                  borderRadius: "7px",
                  p: 1,
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 1.5, px: 2, borderTop: "1px solid #F0F2F4", gap: 1.25 }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            flex: isView ? undefined : 1,
            width: isView ? "100%" : "auto",
            height: 36,
            border: "1px solid #E4E7EB",
            borderRadius: "18px",
            color: "#4B5563",
            fontSize: 11.5,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { background: "#F9FAFB" },
          }}
        >
          {isView ? "Close" : "Cancel"}
        </Button>
        {!isView && (
          <Button
            type="submit"
            form="asset-allocation-form"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : null
            }
            sx={{
              flex: 1,
              height: 36,
              borderRadius: "18px",
              background: "#EF3340",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { background: "#D92B38", boxShadow: "none" },
            }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Issue Asset"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}