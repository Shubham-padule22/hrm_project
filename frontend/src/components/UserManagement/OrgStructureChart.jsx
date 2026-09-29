import React, { useState, useEffect, useRef } from "react";
import { Joyride, STATUS } from "react-joyride";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Avatar,
  Grid,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axiosInstance from "../../Config/axiosInstance";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";

// --- ANIMATION VARIANTS ---
const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerFastContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

const badgeColors = [
  "#12382B",
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#4F46E5",
];

// Custom Tooltip Component matching the design in image_4a0fdf.png

const CustomTooltip = ({
  index,
  step,
  backProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}) => {
  return (
    <Box
      {...tooltipProps}
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        p: 2.5,
        maxWidth: 320,
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
        border: "1px solid #E2E8F0",
        fontFamily: "inherit",
        textAlign: "center",
        mb:5
      }}
    >
      {/* Back Arrow */}
      {/* {index > 0 && (
        <IconButton
          {...backProps}
          size="small"
          sx={{
            p: 0.5,
            mb: 1,
            color: "#64748B",
            "&:hover": { bgcolor: "#F1F5F9" },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )} */}

      {/* Step Title */}
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

      {/* Step Description */}
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

      {/* Footer Controls: Dots and Next/Finish Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Step Indicator Dots */}
        <Stack direction="row" spacing={0.6}>
          {Array.from({ length: size }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === index ? 14 : 6,
                height: 6,
                borderRadius: 3,
                bgcolor: i === index ? "#EF4444" : "#E2E8F0",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Stack>

        {/* Action Button */}
        <Button
          {...primaryProps}
          variant="contained"
          size="small"
          disableElevation
          sx={{
            bgcolor: "#EF4444",
            color: "#FFFFFF",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.75rem",
            px: 2,
            py: 0.6,
            "&:hover": {
              bgcolor: "#DC2626",
            },
          }}
        >
          {isLastStep ? "Finish" : "Next →"}
        </Button>
      </Box>
    </Box>
  );
};

export default function OrgStructureChart() {
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);

  // States for Hierarchy
  const [ceoDept, setCeoDept] = useState(null);
  const [subDepartments, setSubDepartments] = useState([]);

  // States for Organization details from API
  const [orgName, setOrgName] = useState("Loading...");
  const [orgType, setOrgType] = useState("");

  // Joyride Tour State & Steps Configuration
  const [runTour, setRunTour] = useState(false);
  const [tourSteps] = useState([
    {
      target: ".tour-org-chart-container",
      title: "Organization chart",
      content: "See who reports to whom and how teams and departments are organized.",
      disableBeacon: true,
      placement: "bottom",
    }
  ]);

  // Scroll Refs
  const deptContainerRef = useRef(null);
  const employeeSectionRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("hrm_web/department_get/");

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const firstEntry = response.data.data[0];
        setOrgName(firstEntry.organization_name || "Unknown Organization");
        setOrgType(firstEntry.organization_type || "Organization");

        const mappedData = response.data.data.map((dept, index) => {
          const employees = [];

          if (dept.group_employees && typeof dept.group_employees === "object") {
            Object.entries(dept.group_employees).forEach(([role, empArray]) => {
              if (Array.isArray(empArray)) {
                empArray.forEach((empObj, idx) => {
                  const empName = empObj.employee_name || "Unknown";
                  employees.push({
                    id: `${dept.pk_id}-${role}-${idx}`,
                    name: empName,
                    role: role,
                    profilePhoto: empObj.profile_photo,
                  });
                });
              }
            });
          }

          return {
            id: dept.pk_id,
            name: dept.department_name,
            code: dept.department_code,
            count: dept.employee_count || 0,
            badgeBg: badgeColors[index % badgeColors.length],
            employees: employees,
          };
        });

        const ceo = mappedData.find((d) => d.name?.toUpperCase() === "CEO");
        const subs = mappedData.filter((d) => d.name?.toUpperCase() !== "CEO");

        setCeoDept(ceo || null);
        setSubDepartments(subs);

        // Start tour after data successfully loads
        setTimeout(() => setRunTour(true), 600);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setOrgName("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  const handleDeptClick = (dept) => {
    if (selectedDept?.id === dept.id) {
      handleCloseEmployeeSection();
    } else {
      setSelectedDept(dept);
      setTimeout(() => {
        employeeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  };

  const handleCloseEmployeeSection = () => {
    setSelectedDept(null);
    setTimeout(() => {
      deptContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const cardWidth = 110;

  const renderDeptCard = (dept, isCeo = false) => {
    if (!dept) return null;
    const isSelected = selectedDept?.id === dept.id;

    return (
      <Box key={dept.id} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.div variants={fadeUpItem} whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}>
          <Paper
            elevation={0}
            onClick={() => handleDeptClick(dept)}
            sx={{
              bgcolor: isSelected ? dept.badgeBg : "white",
              color: isSelected ? "white" : "#0F172A",
              border: `1.5px solid ${isSelected ? dept.badgeBg : isCeo ? "#144A38" : "#E2E8F0"}`,
              borderRadius: "12px",
              py: 1,
              px: 0.5,
              width: cardWidth,
              minHeight: 75,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isSelected
                ? `0 10px 25px -5px ${dept.badgeBg}80`
                : isCeo
                  ? "0 6px 15px rgba(20,74,56,0.15)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Stack alignItems="center" spacing={0.3} sx={{ width: "100%" }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  borderRadius: "4px",
                  bgcolor: isSelected ? "white" : dept.badgeBg,
                  color: isSelected ? dept.badgeBg : "white",
                  fontWeight: 700,
                  fontSize: "0.55rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                {isCeo && !isSelected ? "" : dept.count}
              </Box>
              <Box sx={{ width: "100%", px: 0.2 }}>
                <Typography
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                  }}
                >
                  {dept.name}
                </Typography>
                {isCeo && (
                  <Typography
                    sx={{
                      fontSize: "0.5rem",
                      color: isSelected ? "rgba(255,255,255,0.85)" : "#64748B",
                      mt: 0.2,
                    }}
                  >
                    Top Level
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pt: 1, pb: 6, ml: 0 }}>
      {/* React Joyride Implementation */}
      {/* <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton={false}
        tooltipComponent={CustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: "#FFFFFF",
            overlayColor: "rgba(0, 0, 0, 0.25)",
            zIndex: 10000,
          },
        }}
      /> */}

      <Container maxWidth="100%">
        {/* Breadcrumbs Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CustomBreadcrumbs />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <Paper
            className="tour-org-chart-container"
            ref={deptContainerRef}
            elevation={0}
            sx={{
              p: { xs: 2, sm: 0 },
              ml: 0,
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "white",
              overflow: "hidden",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
                Organization Hierarchy Chart
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
                <CircularProgress sx={{ color: "#12382B" }} />
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  pb: 4,
                  "&::-webkit-scrollbar": { height: 6 },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: 4 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: subDepartments.length > 6 ? "flex-start" : "center",
                    minWidth: "100%",
                    px: { xs: 2, md: 4 },
                  }}
                >
                  <Stack alignItems="center" spacing={0} sx={{ py: 2, minHeight: 350, width: "max-content" }}>

                    {/* TIER 1: ORGANIZATION CARD */}
                    <Box className="tour-org-top-level" sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} whileHover={{ scale: 1.05, translateY: -2 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            bgcolor: "#0E2A22",
                            color: "white",
                            borderRadius: "10px",
                            py: 1,
                            px: 3,
                            width: 220,
                            textAlign: "center",
                            boxShadow: "0 8px 20px rgba(14, 42, 34, 0.25)",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>{orgName}</Typography>
                          <Typography sx={{ fontSize: "0.65rem", opacity: 0.8, mt: 0.2 }}>{orgType}</Typography>
                        </Paper>
                      </motion.div>
                    </Box>

                    <Box sx={{ width: "2px", height: "25px", bgcolor: "#CBD5E1", my: 0.5 }} />

                    {/* TIER 2: CEO DEPARTMENT */}
                    {ceoDept && (
                      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                        {renderDeptCard(ceoDept, true)}
                      </motion.div>
                    )}

                    {/* TIER 3: OTHER DEPARTMENTS */}
                    {subDepartments.length > 0 && (
                      <Box className="tour-org-departments" sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>

                        {/* Vertical line going down from CEO */}
                        <Box sx={{ width: "2px", height: "24px", bgcolor: "#CBD5E1", position: "absolute", top: -24 }} />

                        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                          <Box sx={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>

                            {/* Horizontal Connector Line */}
                            {subDepartments.length > 1 && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: `${cardWidth / 2}px`,
                                  right: `${cardWidth / 2}px`,
                                  height: "2px",
                                  bgcolor: "#CBD5E1",
                                }}
                              />
                            )}

                            <Stack direction="row" spacing={1.5} sx={{ position: "relative", flexWrap: "nowrap" }}>
                              {subDepartments.map((dept) => (
                                <Box key={dept.id} sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", pt: 2.5 }}>
                                  <Box sx={{ width: "2px", height: "20px", bgcolor: "#CBD5E1", position: "absolute", top: 0 }} />
                                  {renderDeptCard(dept, false)}
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        </motion.div>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* DYNAMIC EMPLOYEE ROSTER PANEL */}
            <AnimatePresence mode="wait">
              {selectedDept && (
                <motion.div
                  key={selectedDept.id}
                  initial={{ opacity: 0, y: 30, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <Box ref={employeeSectionRef} sx={{ p: { xs: 2, sm: 3 } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "#F8FAFC",
                        border: `1.5px solid ${selectedDept.badgeBg}40`,
                        boxShadow: `inset 0 2px 15px ${selectedDept.badgeBg}08`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          width: "100%",
                          mb: 3,
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <GroupIcon sx={{ color: selectedDept.badgeBg, fontSize: 28 }} />
                          <Box>
                            <Typography variant="h6" fontWeight={700} color="#0F172A">
                              {selectedDept.name} Department
                            </Typography>
                            <Typography variant="body2" color="#64748B">
                              • Total Employees: <b>{selectedDept.count}</b>
                            </Typography>
                          </Box>
                        </Stack>

                        <IconButton
                          onClick={handleCloseEmployeeSection}
                          sx={{
                            "&:hover": { color: "#EF4444", bgcolor: "#FEE2E2" },
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>

                      {selectedDept.employees.length === 0 ? (
                        <Typography sx={{ textAlign: "center", py: 3, color: "#94A3B8" }}>
                          No employees assigned to this department yet.
                        </Typography>
                      ) : (
                        <motion.div variants={staggerFastContainer} initial="hidden" animate="visible">
                          <Grid
                            container
                            spacing={2}
                            justifyContent="center"
                            alignItems="stretch"
                            sx={{ width: "100%", m: 0, px: 2 }}
                          >
                            {selectedDept.employees.map((emp) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                size={3}
                                md={4}
                                lg={3}
                                key={emp.id}
                                sx={{ display: "flex", justifyContent: "center" }}
                              >
                                <Paper
                                  component={motion.div}
                                  variants={fadeUpItem}
                                  whileHover={{ y: -3, scale: 1.02 }}
                                  transition={springTransition}
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    width: "100%",
                                    boxSizing: "border-box",
                                    borderRadius: 2,
                                    border: "1px solid #E2E8F0",
                                    bgcolor: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                    transition: "border-color 0.2s",
                                    "&:hover": {
                                      borderColor: selectedDept.badgeBg,
                                    },
                                  }}
                                >
                                  <Avatar
                                    src={
                                      emp.profilePhoto
                                        ? `https://your-api-url.com/media/${emp.profilePhoto}`
                                        : undefined
                                    }
                                    sx={{
                                      bgcolor: selectedDept.badgeBg,
                                      fontWeight: 700,
                                      width: 38,
                                      height: 38,
                                      boxShadow: `0 4px 10px ${selectedDept.badgeBg}40`,
                                    }}
                                  >
                                    {emp.name.charAt(0)}
                                  </Avatar>
                                  <Box sx={{ overflow: "hidden", flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A" noWrap>
                                      {emp.name}
                                    </Typography>
                                    <Typography variant="caption" color="#64748B" display="block" noWrap>
                                      Role: {emp.role}
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </motion.div>
                      )}
                    </Paper>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}