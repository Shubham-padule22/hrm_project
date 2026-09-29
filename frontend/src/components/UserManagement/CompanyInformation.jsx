import React, { useState, useEffect } from "react";
import { Joyride, STATUS } from "react-joyride";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Breadcrumbs,
  Link,
  Stack,
  Container,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import logo from '../../assets/logo.png';
// Direct path SVG icon imports
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

// Snackbar component
import PremiumSnackbar from "../common/PremiumSnackbar";
import { hasPermission } from "../common/permissionUtils";
import axiosInstance from "../../Config/axiosInstance";

// Premium Animation Variants
const springTransition = { type: "spring", stiffness: 350, damping: 30 };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};
const slideRightItem = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: springTransition },
};

// Animated Counter Component
const AnimatedCounter = ({ target }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const finalValue = Number(target) || 0;
    const animation = animate(count, finalValue, {
      duration: 1.5,
      ease: "easeOut",
    });
    return animation.stop;
  }, [target, count]);

  return <motion.span>{rounded}</motion.span>;
};

// Custom Joyride Tooltip UI matching Design Screenshot
const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  onFinishRedirect,
}) => {
  const isWelcomeStep = step.target === "body";

  return (
    <Box
      {...tooltipProps}
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        p: 2.5,
        maxWidth: isWelcomeStep ? 360 : 320,
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
        border: "1px solid #E2E8F0",
        fontFamily: "inherit",
        textAlign: "center",
      }}
    >
      {isWelcomeStep && (
        <Box sx={{ mb: 0, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontWeight: 800,
              fontSize: "1rem",
              color: "#0F172A",
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Company Logo"
              sx={{
                height: 70,
                objectFit: "contain",
                mb: 1,
              }}
            />
            {/* <span style={{ color: "#E11D48" }}>✚</span> ProParamedics */}
          </Box>
        </Box>
      )}

      {step.title && (
        <Typography
          variant="h6"
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#0F172A",
            mb: 0.8,
          }}
        >
          {step.title}
        </Typography>
      )}

      {step.content && (
        <Typography
          variant="body2"
          sx={{
            color: "#64748B",
            fontSize: "0.825rem",
            mb: 2,
            lineHeight: 1.5,
          }}
        >
          {step.content}
        </Typography>
      )}

      <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 1 }}
      >
        <Button
          {...closeProps}
          size="small"
          sx={{
            color: "#64748B",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.775rem",
            minWidth: "auto",
            px: 1,
          }}
        >
          {isWelcomeStep ? "Skip" : "Dismiss"}
        </Button>

        <Stack direction="row" spacing={1} alignItems="center">
          {index > 0 && (
            <Button
              {...backProps}
              size="small"
              sx={{
                color: "#64748B",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.775rem",
              }}
            >
              Back
            </Button>
          )}

        {/* // Inside CustomTooltip component */}
          <Button
            {...primaryProps}
            size="small"
            variant="contained"
            disableElevation
            onClick={(e) => {
              if (isLastStep) {
                onFinishRedirect();
              } else if (primaryProps.onClick) {
                primaryProps.onClick(e);
              }
            }}
            sx={{
              bgcolor: "#E11D48",
              color: "#FFFFFF",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.775rem",
              px: 2,
              py: 0.6,
              "&:hover": {
                bgcolor: "#BE123C",
              },
            }}
          >
            {isWelcomeStep
              ? "Take the Tour"
              : isLastStep
                ? "Got it"
                : "Next"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const CompanyInformation = () => {
  const navigate = useNavigate();
  const canEditCompany = hasPermission(
    "User Management",
    "Company Information",
    "Edit"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Joyride Product Tour State
  const [runTour, setRunTour] = useState(true);

  const tourSteps = [
    {
      target: "body",
      placement: "center",
      title: "Welcome to User Management",
      content:
        "Manage your team, roles and access—all in one place.",
      disableBeacon: true,
    },
    {
      target: ".tour-company-info",
      placement: "bottom",
      title: "Company profile",
      content:
        "Review and update company details, including contact information, address and website.",
    },
    {
      target: ".tour-stats",
      placement: "top",
      title: "Business overview",
      content:
        "See key numbers for employees, vehicles, monthly events and branches at a glance.",
    },
    {
      target: ".tour-last-updated",
      placement: "top-start",
      title: "Recent Updates",
      content: "Track who performed the most recent updates on company info.",
    },
    {
      target: ".tour-compliance",
      placement: "left",
      title: "Licenses & compliance",
      content:
        "Check the status and expiry dates of your licenses, registrations and certifications.",
    },
  ];


  const handleRedirectToOrgChart = () => {
    console.log('redirect');

    setRunTour(false);
    navigate("/organization-chart", { replace: true });
  };

  const handleJoyrideCallback = (data) => {
    const { status, action } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === "close") {
      handleRedirectToOrgChart();
    }
  };

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const [orgRawData, setOrgRawData] = useState(null);
  const [licenses, setLicenses] = useState([]);

  const [formData, setFormData] = useState({
    legalName: "",
    taxId: "",
    headquarters: "",
    phone: "",
    email: "",
    website: "",
  });

  const [statsCounts, setStatsCounts] = useState({
    employees: "0",
    trips: "0",
    ambulances: "0",
    departments: "0",
  });

  const showSnackbar = (type, title, message) => {
    setSnackbar({ open: true, type, title, message });
  };

  // Fetch API Data
  const fetchOrganizationData = async () => {
    try {
      const response = await axiosInstance.get("/hrm_web/OrganizationGet/");
      const result = response.data;

      if (result.data && result.data.length > 0) {
        const org = result.data[result.data.length - 1];
        setOrgRawData(org);

        setFormData({
          legalName: org.legal_name || "",
          taxId: org.tax_id || "",
          headquarters: org.headquarters || "",
          phone: org.phone_number || "",
          email: org.email || "",
          website: org.website || "",
        });

        if (org.documents && org.documents.length > 0) {
          const mappedLicenses = org.documents.map((doc, index) => {
            const isActive =
              String(doc.document_status).toLowerCase() === "active";
            return {
              id: doc.document_number || doc.pk_id || index,
              title: doc.document_name || "Document",
              expiry: doc.expiry_date ? `Expires ${doc.expiry_date}` : "-",
              status: isActive ? "Active" : "Pending",
              raw: doc,
            };
          });
          setLicenses(mappedLicenses);
        } else {
          setLicenses([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar(
        "error",
        "Connection Error",
        "Failed to fetch organization data."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [empRes, tripsRes, ambRes, deptRes] = await Promise.all([
        axiosInstance.get("/hrm_web/total_employees/"),
        axiosInstance.get("/hrm_web/total_trips/"),
        axiosInstance.get("/hrm_web/TotalAmbulances/"),
        axiosInstance.get("/hrm_web/total_department/"),
      ]);

      setStatsCounts({
        employees: empRes.data?.total_employees ?? "0",
        trips: tripsRes.data?.total_incidence ?? "0",
        ambulances:
          ambRes.data?.total_ambulances ??
          ambRes.data?.TotalAmbulances ??
          ambRes.data?.count ??
          ambRes.data?.total ??
          "0",
        departments:
          deptRes.data?.total_department ??
          deptRes.data?.total_departments ??
          deptRes.data?.count ??
          "0",
      });
    } catch (error) {
      console.error("Error fetching stats data:", error);
    }
  };

  useEffect(() => {
    fetchOrganizationData();
    fetchDashboardStats();
  }, []);

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      showSnackbar(
        "warning",
        "Required Field",
        "Phone number cannot be empty."
      );
      return false;
    }

    if (!formData.legalName.trim()) {
      showSnackbar("warning", "Required Field", "Legal name is required.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    const payload = new FormData();
    payload.append("legal_name", formData.legalName);
    payload.append("tax_id", formData.taxId);
    payload.append("headquarters", formData.headquarters);
    payload.append("phone_number", formData.phone);
    payload.append("email", formData.email);
    payload.append("website", formData.website);

    if (orgRawData?.pk_id) {
      payload.append("organization", orgRawData.pk_id);
      payload.append("pk_id", orgRawData.pk_id);
    }

    payload.append("organization_name", orgRawData?.organization_name || "");
    payload.append("organization_type", orgRawData?.organization_type || "");
    payload.append("established_year", orgRawData?.established_year || "");
    payload.append("license_number", orgRawData?.license_number || "");
    payload.append(
      "status",
      orgRawData?.status !== undefined ? orgRawData.status : 1
    );
    payload.append(
      "is_deleted",
      orgRawData?.is_deleted !== undefined ? orgRawData.is_deleted : 0
    );
    payload.append("added_by", orgRawData?.added_by || "admin");

    if (orgRawData?.documents && orgRawData.documents.length > 0) {
      orgRawData.documents.forEach((doc) => {
        payload.append("document_names", doc.document_name || "");
        payload.append("document_numbers", doc.document_number || "");
        payload.append("issue_dates", doc.issue_date || "");
        payload.append("expiry_dates", doc.expiry_date || "");
        payload.append("document_status", doc.document_status || "");
      });
    }

    try {
      const response = await axiosInstance.post(
        "/hrm_web/OrganizationPost/",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsEditing(false);
        showSnackbar(
          "success",
          "Update Successful",
          "Company information has been updated."
        );
        await fetchOrganizationData();
      } else {
        showSnackbar(
          "error",
          "Update Failed",
          "Something went wrong on the server."
        );
      }
    } catch (error) {
      console.error("Error saving data:", error);
      const errorMessage =
        error.response?.data?.message || "Unable to connect to the server.";
      showSnackbar("error", "Network Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const statsData = [
    {
      id: 1,
      value: statsCounts.employees,
      label: "Total Employees",
      bgColor: "#EFFCF6",
      badgeBg: "#DCFCE7",
      iconColor: "#10B981",
      textColor: "#059669",
      icon: PersonOutlineOutlinedIcon,
    },
    {
      id: 2,
      value: statsCounts.ambulances,
      label: "Active Vehicles",
      bgColor: "#F0F4FF",
      badgeBg: "#DBEAFE",
      iconColor: "#3B82F6",
      textColor: "#2563EB",
      icon: LocalShippingOutlinedIcon,
    },
    {
      id: 3,
      value: statsCounts.trips,
      label: "Total Events",
      bgColor: "#FFFDF0",
      badgeBg: "#FEF3C7",
      iconColor: "#F59E0B",
      textColor: "#F59E0B",
      icon: CalendarTodayOutlinedIcon,
    },
    {
      id: 4,
      value: statsCounts.departments,
      label: "Total Departments",
      bgColor: "#F8F5FF",
      badgeBg: "#F3E8FF",
      iconColor: "#A855F7",
      textColor: "#9333EA",
      icon: LocationCityOutlinedIcon,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#F8FAFC",
        }}
      >
        <CircularProgress sx={{ color: "#144A38" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        ml: 0,
        pt: 1,
        px: { xs: 2, sm: 3, md: 1, ml: 1 },
      }}
    >
      {/* <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        disableBeacon={true}
        disableOverlayClose
        scrollToFirstStep
        spotlightPadding={6}
        disableScrolling={false}
        tooltipComponent={(props) => (
          <CustomTooltip
            {...props}
            isLastStep={props.index === tourSteps.length - 1}
            onFinishRedirect={handleRedirectToOrgChart}
          />
        )}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
            overlayColor: "rgba(15, 23, 42, 0.45)",
          },
        }}
      /> */}

      <PremiumSnackbar
        open={snackbar.open}
        setOpen={(val) => setSnackbar((prev) => ({ ...prev, open: val }))}
        type={snackbar.type}
        title={snackbar.title}
        message={snackbar.message}
      />

      <Container maxWidth="100%" disableGutters>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Breadcrumbs
            separator={
              <NavigateNextIcon fontSize="small" sx={{ color: "#919EAB" }} />
            }
            sx={{ mb: 1, ml: 1 }}
          >
            <Link
              underline="hover"
              color="#626A75"
              href="#"
              sx={{ fontSize: "0.875rem" }}
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="#626A75"
              href="#"
              sx={{ fontSize: "0.875rem" }}
            >
              User Management
            </Link>
            <Typography
              color="#1D293D"
              sx={{ fontSize: "0.875rem", fontWeight: 700 }}
            >
              Company Information
            </Typography>
          </Breadcrumbs>
        </motion.div>

        <Grid container spacing={1} alignItems="stretch">
          <Grid item xs={12} md={9} size={9}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%" }}
            >
              {/* Tour target for Company Info */}
              <Box
                className="tour-company-info"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  height: "100%",
                  border: "1px solid #E2E8F0",
                  ml: 1,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                  <Grid
                    container
                    spacing={2}
                    alignItems="stretch"
                    sx={{ flex: 1, textAlign: "left" }}
                  >
                    <Grid item>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={springTransition}
                      >
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 46,
                            height: 46,
                            background:
                              "linear-gradient(135deg, #0C3328 0%, #1A5C48 100%)",
                            color: "#fff",
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        >
                          {formData.legalName
                            ? formData.legalName.substring(0, 2).toUpperCase()
                            : "NC"}
                        </Avatar>
                      </motion.div>
                    </Grid>

                    <Grid item xs>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ color: "#0F172B", fontSize: ".8rem" }}
                      >
                        <b>{formData.legalName || "Organization Name"}</b>
                      </Typography>
                      <Typography sx={{ fontSize: ".6rem", color: "#64748B" }}>
                        {orgRawData?.organization_type || "Organization Type"}
                      </Typography>

                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip
                          label={
                            orgRawData?.status === 1 ? "Active" : "Inactive"
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              orgRawData?.status === 1 ? "#DCFDF2" : "#FEE2E2",
                            color:
                              orgRawData?.status === 1 ? "#059669" : "#DC2626",
                            fontSize: ".5rem",
                            height: ".8rem",
                            fontWeight: 600,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="#64748B"
                          sx={{ fontSize: ".5rem" }}
                        >
                          Est. {orgRawData?.established_year || "YYYY"} ·
                          License #{orgRawData?.license_number || "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                      mt: { xs: 2, md: 0 },
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div
                          key="editing-actions"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={springTransition}
                          style={{ display: "flex", gap: "8px" }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloseIcon fontSize="small" />}
                            disabled={saving}
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                legalName: orgRawData?.legal_name || "",
                                taxId: orgRawData?.tax_id || "",
                                headquarters: orgRawData?.headquarters || "",
                                phone: orgRawData?.phone_number || "",
                                email: orgRawData?.email || "",
                                website: orgRawData?.website || "",
                              });
                            }}
                            sx={{
                              color: "#64748B",
                              borderColor: "#CBD5E1",
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "#F1F5F9",
                                borderColor: "#94A3B8",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={
                              saving ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <SaveIcon fontSize="small" />
                              )
                            }
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                              bgcolor: "#144A38",
                              color: "#FFFFFF",
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              boxShadow: "0 4px 12px rgba(20, 74, 56, 0.2)",
                              "&:hover": { bgcolor: "#0D3326" },
                            }}
                          >
                            {saving ? "Updating..." : "Update"}
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="view-actions"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={springTransition}
                        >
                          {canEditCompany && (
                            <Box
                              onClick={() => setIsEditing(true)}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.8,
                                border: "1px solid #E2E8F0",
                                px: 1.8,
                                py: 0.6,
                                borderRadius: 2,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  bgcolor: "#F8FAFC",
                                  borderColor: "#CBD5E1",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                },
                              }}
                            >
                              <EditOutlinedIcon
                                sx={{ fontSize: 16, color: "#64748B" }}
                              />
                              <Typography
                                variant="caption"
                                fontWeight={600}
                                color="#64748B"
                              >
                                Edit
                              </Typography>
                            </Box>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Box>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <Grid container spacing={2}>
                    {[
                      {
                        key: "legalName",
                        label: "LEGAL NAME",
                        value: formData.legalName,
                        icon: <BusinessOutlinedIcon fontSize="1rem" />,
                      },
                      {
                        key: "taxId",
                        label: "Company Number",
                        value: formData.taxId,
                        icon: <ReceiptOutlinedIcon fontSize="1rem" />,
                      },
                      {
                        key: "headquarters",
                        label: "HEADQUARTERS",
                        value: formData.headquarters,
                        icon: <LocationOnOutlinedIcon fontSize="1rem" />,
                      },
                      {
                        key: "phone",
                        label: "MAIN PHONE",
                        value: formData.phone,
                        icon: <PhoneOutlinedIcon fontSize="1rem" />,
                      },
                      {
                        key: "email",
                        label: "PRIMARY EMAIL",
                        value: formData.email,
                        icon: <EmailOutlinedIcon fontSize="1rem" />,
                      },
                      {
                        key: "website",
                        label: "WEBSITE",
                        value: formData.website || "N/A",
                        icon: <LanguageOutlinedIcon fontSize="1rem" />,
                      },
                    ].map((field, index) => (
                      <Grid item xs={12} md={6} size={6} key={index}>
                        <motion.div variants={fadeUpItem} layout>
                          <motion.div
                            whileHover={
                              !isEditing
                                ? {
                                  scale: 1.02,
                                  boxShadow:
                                    "0px 4px 15px rgba(0,0,0,0.03)",
                                }
                                : {}
                            }
                            transition={springTransition}
                            style={{ borderRadius: "10px" }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                px: 2,
                                bgcolor: isEditing ? "#FFFFFF" : "#F8FAFC",
                                borderRadius: 2.5,
                                border: isEditing
                                  ? "1.5px solid #144A38"
                                  : "1px solid #F1F5F9",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                textAlign: "left",
                              }}
                            >
                              <Box
                                sx={{
                                  color: "#626A75",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {field.icon}
                              </Box>
                              <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#626A75",
                                    fontWeight: 700,
                                    fontSize: "0.525rem",
                                    letterSpacing: 0.5,
                                    display: "block",
                                  }}
                                >
                                  {field.label}
                                </Typography>
                                <AnimatePresence mode="wait">
                                  {isEditing ? (
                                    <motion.div
                                      key="input"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <TextField
                                        variant="standard"
                                        fullWidth
                                        value={field.value}
                                        onChange={handleInputChange(field.key)}
                                        sx={{
                                          "& .MuiInputBase-input": {
                                            fontSize: "12px",
                                            padding: 0,
                                            fontWeight: 500,
                                          },
                                        }}
                                        InputProps={{ disableUnderline: true }}
                                      />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="text"
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                          color: "#0F172A",
                                          fontWeight: 700,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        {field.value}
                                      </Typography>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Box>
                            </Box>
                          </motion.div>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3} size={3}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ height: "100%", width: "100%" }}
            >
              {/* Tour target for Compliance */}
              <Box
                className="tour-compliance"
                sx={{
                  border: "1px solid #E2E8F0",
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  height: "100%",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2.5}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0F172A",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Compliance & Licenses
                  </Typography>
                  <Chip
                    label={`${licenses.filter(
                      (l) => String(l.status).toLowerCase() === "active"
                    ).length
                      }/${licenses.length} Active`}
                    size="small"
                    sx={{
                      bgcolor: "#F1F5F9",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: 11,
                      borderRadius: 2,
                    }}
                  />
                </Stack>

                {licenses.length > 0 ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <Stack spacing={0.5}>
                      {licenses.map((item, index) => {
                        const statusStr = String(item.status).toLowerCase();
                        let statusConfig = {
                          text: item.status,
                          chipColor: "#D97706",
                          chipBg: "rgba(217, 119, 6, 0.08)",
                          chipBorder: "rgba(217, 119, 6, 0.2)",
                          iconColor: "#D97706",
                          iconBg: "#FEF3C7",
                          Icon: PendingRoundedIcon,
                        };

                        if (statusStr === "active") {
                          statusConfig = {
                            text: "Active",
                            chipColor: "#0D6EFD",
                            chipBg: "rgba(13, 110, 253, 0.08)",
                            chipBorder: "rgba(13, 110, 253, 0.2)",
                            iconColor: "#137333",
                            iconBg: "#E6F4EA",
                            Icon: CheckCircleIcon,
                          };
                        } else if (statusStr === "expired") {
                          statusConfig = {
                            text: "Expired",
                            chipColor: "#DC2626",
                            chipBg: "rgba(220, 38, 38, 0.08)",
                            chipBorder: "rgba(220, 38, 38, 0.2)",
                            iconColor: "#DC2626",
                            iconBg: "#FEE2E2",
                            Icon: CancelOutlinedIcon,
                          };
                        }

                        return (
                          <React.Fragment key={item.id}>
                            <motion.div variants={slideRightItem}>
                              <motion.div
                                whileHover={{
                                  scale: 1.02,
                                  x: 5,
                                  backgroundColor: "#F8FAFC",
                                }}
                                transition={springTransition}
                                style={{
                                  padding: "12px",
                                  borderRadius: "12px",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        bgcolor: statusConfig.iconBg,
                                        color: statusConfig.iconColor,
                                      }}
                                    >
                                      <statusConfig.Icon
                                        sx={{ fontSize: 18 }}
                                      />
                                    </Box>
                                    <Box>
                                      <Typography
                                        sx={{
                                          fontSize: 14,
                                          fontWeight: 600,
                                          color: "#1E293B",
                                          lineHeight: 1.3,
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        {item.title}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Chip
                                    label={statusConfig.text}
                                    size="small"
                                    sx={{
                                      height: 24,
                                      borderRadius: "12px",
                                      px: 0.8,
                                      fontWeight: 600,
                                      fontSize: 11,
                                      textTransform: "capitalize",
                                      color: statusConfig.chipColor,
                                      bgcolor: statusConfig.chipBg,
                                      border: "1px solid",
                                      borderColor: statusConfig.chipBorder,
                                    }}
                                  />
                                </Stack>
                              </motion.div>
                            </motion.div>
                            {index !== licenses.length - 1 && (
                              <Divider
                                sx={{ borderColor: "#F1F5F9", my: 0.5 }}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Stack>
                  </motion.div>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 4 }}
                  >
                    No licenses found.
                  </Typography>
                )}
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={9} size={9} sx={{ mt: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ height: "100%" }}
            >
              {/* Tour target for Business Stats */}
              <Box
                className="tour-stats"
                sx={{
                  px: 2,
                  py: 2,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  height: "100%",
                  border: "1px solid #E2E8F0",
                  ml: 1,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1E293B",
                    fontSize: "1rem",
                    mb: 1.5,
                    letterSpacing: "-0.2px",
                    textAlign: "left",
                  }}
                >
                  Business Statistics
                </Typography>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <Grid container spacing={2}>
                    {statsData.map((stat) => (
                      <Grid item xs={12} sm={6} md={3} size={3} key={stat.id}>
                        <motion.div variants={fadeUpItem}>
                          <motion.div
                            whileHover={{
                              scale: 1.03,
                              y: -4,
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                            }}
                            transition={springTransition}
                            style={{ borderRadius: "16px" }}
                          >
                            <Box
                              sx={{
                                bgcolor: stat.bgColor,
                                borderRadius: "16px",
                                px: 2,
                                py: 2,
                                minHeight: 100,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                              >
                                <motion.div
                                  whileHover={{ rotate: 15 }}
                                  transition={springTransition}
                                >
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: "50%",
                                      bgcolor: stat.badgeBg,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <stat.icon
                                      sx={{
                                        fontSize: 18,
                                        color: stat.iconColor,
                                      }}
                                    />
                                  </Box>
                                </motion.div>
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    letterSpacing: "-0.1px",
                                  }}
                                >
                                  {stat.label}
                                </Typography>
                              </Stack>
                              <Box sx={{ textAlign: "center", py: 1, mt: 1 }}>
                                <Typography
                                  sx={{
                                    fontSize: {
                                      xs: "2rem",
                                      sm: "2.25rem",
                                      md: "1.75rem",
                                    },
                                    fontWeight: 700,
                                    color: stat.textColor,
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.5px",
                                  }}
                                >
                                  <AnimatedCounter target={stat.value} />
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3} size={3} sx={{ mt: 3 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            >
              {/* Tour target for Last Updated badge */}
              <Box
                className="tour-last-updated"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                  maxWidth: 420,
                  py: 1,
                  px: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    textAlign: "left",
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={springTransition}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#103C2F",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        boxShadow: "0 2px 8px rgba(16, 60, 47, 0.3)",
                      }}
                    >
                      {orgRawData?.modify_by
                        ? orgRawData.modify_by.substring(0, 2).toUpperCase()
                        : "AD"}
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", lineHeight: 1.2 }}>
                      <Box
                        component="span"
                        sx={{ fontWeight: 700, color: "#1E293B" }}
                      >
                        {orgRawData?.modify_by || "Admin"}
                      </Box>{" "}
                      <Box
                        component="span"
                        sx={{ color: "#6B7280", fontWeight: 500 }}
                      >
                        updated
                      </Box>
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#9CA3AF",
                        lineHeight: 1.2,
                        mt: 0.2,
                      }}
                    >
                      company info
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#9CA3AF",
                    whiteSpace: "nowrap",
                    mt: 0.2,
                    mr: 2,
                  }}
                >
                  {orgRawData?.modify_date
                    ? new Date(orgRawData.modify_date).toLocaleDateString()
                    : "Recently"}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CompanyInformation;