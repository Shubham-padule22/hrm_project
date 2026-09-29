import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Autocomplete,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../Config/axiosInstance";
import PremiumSnackbar from "../common/PremiumSnackbar";

/* =========================================================
   APPLE-STYLE SLIM SCROLLBAR (MAC OS LOOK)
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
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0, 0, 0, 0.15) transparent",
};

const initialFormData = {
  employee: null,
  email: "",
  bankName: "",
  bankAddress: "",
  accountNumber: "",
  accountName: "",
  sortCode: "",
};

const buildEmployeeFromAccount = (account) => {
  if (!account) return null;
  const emp = account.employee;

  if (emp && typeof emp === "object") {
    return {
      id: emp.id ?? emp.clg_id,
      refId: emp.refId ?? emp.clg_ref_id,
      name:
        emp.name ||
        `${emp.clg_first_name || ""} ${emp.clg_last_name || ""}`.trim() ||
        account.account_name ||
        "",
      email: emp.email || emp.clg_email || account.email || "",
    };
  }

  return {
    id: emp ?? account.employee_id,
    refId: emp ?? account.employee_id,
    name: account.account_name || "",
    email: account.email || "",
  };
};

const buildFormDataFromAccount = (account) => ({
  employee: buildEmployeeFromAccount(account),
  email: account?.email || "",
  bankName: account?.bank_name || "",
  bankAddress: account?.bank_address || "",
  accountNumber: account?.account_number || "",
  accountName: account?.account_name || "",
  sortCode: account?.routing_number || "",
});

const AddBankAccountModal = ({ open, onClose, onSave, editData = null }) => {
  const isEditMode = Boolean(editData);

  const [formData, setFormData] = useState(initialFormData);
  const [employeeInputValue, setEmployeeInputValue] = useState(""); // <-- Added state to control Employee Search input
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const fetchEmployeeOptions = async (searchTerm = "") => {
    try {
      const response = await axiosInstance.get(
        `/hrm_web/employee_registretion/?search=${encodeURIComponent(searchTerm)}`,
      );

      const data = response.data;
      const employees = Array.isArray(data)
        ? data
        : data?.data || data?.results || [];

      const mappedEmployees = employees.map((employee) => ({
        id: employee.clg_id,
        refId: employee.clg_ref_id,
        name: `${employee.clg_first_name || ""} ${
          employee.clg_last_name || ""
        }`.trim(),
        email: employee.clg_email || "",
        originalData: employee,
      }));

      setEmployeeOptions(mappedEmployees);
    } catch (error) {
      console.error(
        "Failed to fetch employee options:",
        error.response?.data || error.message,
      );
      setEmployeeOptions([]);
    }
  };

  useEffect(() => {
    fetchEmployeeOptions("");
  }, []);

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        const newFormData = buildFormDataFromAccount(editData);
        setFormData(newFormData);
        // Set the initial value for the autocomplete input
        setEmployeeInputValue(
          newFormData.employee?.name
            ? `${newFormData.employee.name} (${newFormData.employee.refId || newFormData.employee.id})`
            : "",
        );
      } else {
        setFormData(initialFormData);
        setEmployeeInputValue("");
      }
      setErrors({});
    }
  }, [open, editData]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEmployeeInputValue("");
    setErrors({});
    setIsSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ---------------------------------------------------------
  // UPDATED: Centralized handler strips special characters
  // ---------------------------------------------------------
  const handleChange = (field) => (event) => {
    let value = event.target.value;

    if (field === "accountName") {
      // Letters and spaces only
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === "bankName") {
      // Letters, numbers, and spaces only
      value = value.replace(/[^a-zA-Z0-9\s]/g, "");
    } else if (field === "accountNumber") {
      // Numbers only
      value = value.replace(/[^0-9]/g, "");
    } else if (field === "bankAddress") {
      // Alphanumeric + basic address punctuation (comma, period, hyphen, space)
      value = value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
    }

    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const handleEmployeeChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      employee: newValue,
      email: newValue?.email || prev.email,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee || !formData.employee.id) {
      newErrors.employee = "Please select a valid employee";
    }
    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }
    if (!formData.bankAddress.trim()) {
      newErrors.bankAddress = "Bank address is required";
    }
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }
    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }
    if (!formData.sortCode.trim()) {
      newErrors.sortCode = "Sort code is required";
    } else if (formData.sortCode.replace(/\D/g, "").length !== 6) {
      newErrors.sortCode = "Enter a valid 6 digit sort code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setIsSaving(true);

      const payload = {
        employee: Number(formData.employee.id),
        bank_name: formData.bankName,
        bank_address: formData.bankAddress,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
        routing_number: formData.sortCode,
        account_type: (isEditMode && editData?.account_type) || "checking",
      };

      let response;

      if (isEditMode) {
        const accountId = editData?.bank_id ?? editData?.id;
        response = await axiosInstance.patch(
          `/hrm_web/employee_bank_accounts/${accountId}/`,
          payload,
        );
      } else {
        response = await axiosInstance.post(
          "/hrm_web/employee_bank_accounts/",
          payload,
        );
      }

      setSnackbar({
        open: true,
        type: "success",
        title: "Success",
        message: isEditMode
          ? "Bank account updated successfully!"
          : "Bank account added successfully!",
      });

      if (onSave) {
        await onSave(response.data);
      }

      handleClose();
    } catch (error) {
      let errorMessage = isEditMode
        ? "Failed to update bank account. Please try again."
        : "Failed to save bank account. Please try again.";

      if (error.response?.data?.errors) {
        const beErrors = error.response.data.errors;

        if (beErrors.routing_number) {
          errorMessage = beErrors.routing_number[0];
        } else if (beErrors.employee) {
          errorMessage = beErrors.employee[0];
        }

        setErrors((prev) => ({
          ...prev,
          sortCode: beErrors.routing_number
            ? beErrors.routing_number[0]
            : prev.sortCode,
          employee: beErrors.employee ? beErrors.employee[0] : prev.employee,
        }));
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setSnackbar({
        open: true,
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 500,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,.15)",
            m: 1.5,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
            {isEditMode ? "Edit Bank Account" : "Add Bank Account"}
          </Typography>

          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: "#9CA3AF",
              "&:hover": { background: "#F4F5F6" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <DialogContent
          sx={{ p: 3.5, "&:last-child": { pb: 1 }, ...macScrollbarStyle }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#4B5563",
                  mb: 0.5,
                }}
              >
                Employee <span style={{ color: "#EF4444" }}>*</span>
              </Typography>
              <Autocomplete
                size="small"
                options={employeeOptions}
                value={formData.employee || null}
                onChange={handleEmployeeChange}
                inputValue={employeeInputValue}
                // UPDATED: Filter Employee Search input
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === "input") {
                    // Strips special characters while searching
                    const sanitized = newInputValue.replace(
                      /[^a-zA-Z0-9\s]/g,
                      "",
                    );
                    setEmployeeInputValue(sanitized);
                    fetchEmployeeOptions(sanitized);
                  } else {
                    setEmployeeInputValue(newInputValue);
                  }
                }}
                getOptionLabel={(option) =>
                  option?.name
                    ? `${option.name} (${option.refId || option.id})`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                sx={{
                  "& .MuiAutocomplete-listbox": {
                    maxHeight: "180px",
                    overflowY: "auto",
                    ...macScrollbarStyle,
                  },
                }}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      fontSize: 12,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start !important",
                      py: "8px !important",
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {option?.name || "Unknown Employee"}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                      {option?.refId || option?.id} • {option?.email || "-"}
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search employee name..."
                    error={Boolean(errors.employee)}
                    helperText={errors.employee}
                    sx={inputStyle}
                  />
                )}
              />
            </Box>

            <FormField
              label="Email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="Enter employee email"
              error={errors.email}
            />

            <FormField
              label="Bank Name"
              required
              value={formData.bankName}
              onChange={handleChange("bankName")}
              placeholder="e.g. Chase Bank"
              error={errors.bankName}
            />

            <FormField
              label="Bank Address"
              required
              value={formData.bankAddress}
              onChange={handleChange("bankAddress")}
              placeholder="e.g. 123 Main Street, New York"
              error={errors.bankAddress}
            />

            {/* Row gap reduced from 3 to 2 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#4B5563",
                    mb: 0.5,
                  }}
                >
                  Account Number <span style={{ color: "#EF4444" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.accountNumber}
                  onChange={handleChange("accountNumber")}
                  placeholder="Enter account number"
                  error={Boolean(errors.accountNumber)}
                  helperText={errors.accountNumber}
                  sx={inputStyle}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#4B5563",
                    mb: 0.5,
                  }}
                >
                  Account Name <span style={{ color: "#EF4444" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.accountName}
                  onChange={handleChange("accountName")}
                  placeholder="Enter account name"
                  error={Boolean(errors.accountName)}
                  helperText={errors.accountName}
                  sx={inputStyle}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#4B5563",
                  mb: 0.5,
                }}
              >
                Bank Sort Code 6 Digit{" "}
                <span style={{ color: "#EF4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.sortCode}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  setFormData((previous) => ({ ...previous, sortCode: value }));
                  setErrors((previous) => ({ ...previous, sortCode: "" }));
                }}
                placeholder="e.g. 071000"
                error={Boolean(errors.sortCode)}
                helperText={errors.sortCode}
                inputProps={{ maxLength: 6 }}
                sx={inputStyle}
              />
            </Box>
          </Box>
        </DialogContent>

        {/* Buttons */}
        <Box
          sx={{
            px: 3.5,
            py: 2.5,
            display: "flex",
            gap: 2,
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <Button
            fullWidth
            onClick={handleSave}
            disabled={isSaving}
            variant="contained"
            sx={{
              height: 48,
              borderRadius: "24px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              background:
                "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
              boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
              "&:hover": {
                background:
                  "linear-gradient(225deg, #C81A2B 14.64%, #E53945 85.36%)",
                boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
              },
            }}
          >
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Update Bank Account"
                : "Save & Initiate Verification"}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
            disabled={isSaving}
            sx={{
              height: 48,
              borderRadius: "24px",
              textTransform: "none",
              borderColor: "#E5E7EB",
              color: "#6B7280",
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": {
                backgroundColor: "#F9FAFB",
                borderColor: "#D1D5DB",
                color: "#374151",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Dialog>

      <PremiumSnackbar
        open={snackbar.open}
        setOpen={(val) => setSnackbar((prev) => ({ ...prev, open: val }))}
        type={snackbar.type}
        title={snackbar.title}
        message={snackbar.message}
      />
    </>
  );
};

const FormField = ({
  label,
  required,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <Box>
    <Typography
      sx={{ fontSize: 14, fontWeight: 600, color: "#4B5563", mb: 0.5 }}
    >
      {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
    </Typography>
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={Boolean(error)}
      helperText={error}
      sx={inputStyle}
    />
  </Box>
);

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    height: 48,
    borderRadius: "10px",
    background: "#fff",
    "& fieldset": { borderColor: "#E5E7EB", borderWidth: "1px" },
    "& :hover fieldset": { borderColor: "#DC1F30" },
    "&.Mui-focused fieldset": { borderColor: "#DC1F30", borderWidth: "1px" },
    "&.Mui-error fieldset": { borderColor: "#EF4444" },
  },
  "& .MuiInputBase-input": { fontSize: 15 },
  "& .MuiInputBase-input::placeholder": { color: "#9CA3AF", opacity: 1 },
  "& .MuiFormHelperText-root": { fontSize: 12, marginLeft: 0 },
};

export default AddBankAccountModal;
