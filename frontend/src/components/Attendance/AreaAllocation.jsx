import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  Skeleton,
} from "@mui/material";
import { motion, animate } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AreaAllocationMap from "./AreaAllocationMap";

// Aapka axiosInstance import
import axiosInstance from "../../Config/axiosInstance";

// Naya Modal Import
import AssignTerritoryModal from "./AssignTerritoryModal";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";

// ==========================================
// 1. ANIMATED COUNTER COMPONENT
// ==========================================
const AnimatedCounter = ({ from = 0, to, duration = 1.2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: duration,
      ease: "easeOut",
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });
    return () => controls.stop();
  }, [from, to, duration]);

  return <>{count}</>;
};

// ==========================================
// 2. ANIMATION VARIANTS
// ==========================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Colors for Dynamic Territories
const territoryColors = [
  "#2979ff",
  "#10b981",
  "#7c3aed",
  "#f59e0b",
  "#ef233c",
  "#0891b2",
];

const AreaAllocation = () => {
  const [territories, setTerritories] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [crewData, setCrewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapEmployees, setMapEmployees] = useState([]);

  // ==========================================
  // 3. API INTEGRATION WITH YOUR AXIOS INSTANCE
  // ==========================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Aapke axiosInstance ke through API call (baseURL already set hai)
        const [areaResponse, crewResponse] = await Promise.all([
          axiosInstance.get("hrm_web/area_allocation_map/"),
          axiosInstance.get("hrm_web/employee_status_areawise/"),
        ]);

        const areaData = areaResponse.data;
        const crewApiData = crewResponse.data;

        const mapEmployeeList = [];

        (areaData.data || []).forEach((district) => {
          // Active employees
          (district.active_employees || []).forEach((emp) => {
            mapEmployeeList.push({
              id: emp.employee_id,
              code: emp.employee_code,
              name: emp.employee_name,
              latitude: emp.latitude,
              longitude: emp.longitude,
              status: "active",
              lateMinutes: 0,
              district: district.clg_district_id__dst_name,
            });
          });

          // Late employees
          (district.late_comer_employees || []).forEach((emp) => {
            const existingIndex = mapEmployeeList.findIndex(
              (item) => item.id === emp.employee_id,
            );

            const lateEmployee = {
              id: emp.employee_id,
              code: emp.employee_code,
              name: emp.employee_name,
              latitude: emp.latitude,
              longitude: emp.longitude,
              status: "late",
              lateMinutes: emp.late_minutes || 0,
              district: district.clg_district_id__dst_name,
            };

            // Late status overrides active status
            if (existingIndex !== -1) {
              mapEmployeeList[existingIndex] = lateEmployee;
            } else {
              mapEmployeeList.push(lateEmployee);
            }
          });
        });

        setMapEmployees(mapEmployeeList);

        // 1. Territories Mapping
        const formattedTerritories = (areaData.data || []).map(
          (item, index) => ({
            name: item.clg_district_id__dst_name || "Unknown",
            count: item.total || 0,
            color: territoryColors[index % territoryColors.length],
          }),
        );

        setTerritories(formattedTerritories);

        // 2. Summary Mapping
        setApiSummary({
          total: areaData.total_employees || 0,
          active: areaData.today_active || 0,
          late: areaData.late_comers || 0,
          offDuty: areaData.off_duty || 0,
        });

        // 3. Crew Data Mapping
        const crewArray = Array.isArray(crewApiData)
          ? crewApiData
          : crewApiData.data || [];

        const formattedCrew = crewArray.map((emp) => {
          const firstName = emp.clg_first_name || "";
          const lastName = emp.clg_last_name || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Unknown";

          const initF = firstName ? firstName.charAt(0).toUpperCase() : "";
          const initL = lastName ? lastName.charAt(0).toUpperCase() : "";
          const initials = initF + initL || "?";

          let color = "#94a3b8";
          let statusLabel = "Unknown";

          if (emp.status === "active") {
            color = "#10b981";
            statusLabel = "Active";
          } else if (emp.status === "late_comer") {
            color = "#f59e0b";
            statusLabel = "Late";
          } else if (emp.status === "off_duty") {
            color = "#ef233c";
            statusLabel = "Off Duty";
          }

          return {
            id: emp.clg_id || Math.random(),
            name: fullName,
            initials: initials,
            role: emp.district_name || "Unassigned",
            statusLabel: statusLabel,
            color: color,
          };
        });

        setCrewData(formattedCrew);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      sx={{
        minHeight: "100vh",
        background: "#f6f8fb",
        p: 2,
        color: "#263238",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Breadcrumb */}
      <CustomBreadcrumbs />
      {/* Search + Button */}

      <Card
        component={motion.div}
        variants={itemVariants}
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: "1px solid #edf0f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2, // Ensures proper spacing between search and button
          boxShadow: "0px 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <TextField
          size="small"
          placeholder="Search ..."
          sx={{
            flexGrow: 1,
            // Removed maxWidth to let it fill the space as shown in the image
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px", // Exact pill shape matching the image
              background: "#f8fafc", // Soft gray background
              fontSize: 14,
              height: 42, // Slightly taller for better proportions
              "& fieldset": {
                border: "none", // Removes the outline entirely to match the flat design
              },
            },
            "& .MuiOutlinedInput-input": {
              paddingLeft: "20px", // Indents the placeholder to match the reference
              color: "#64748b",
            },
          }}
          // Removed the SearchIcon startAdornment to exactly match the provided image
        />

        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: "12px",
            background:
              "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
            boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            px: 2.5,
            py: 0.5,
            whiteSpace: "nowrap",
            "& hover": {
              background:
                "linear-gradient(225deg, #C81A2B 14.64%, #E53945 85.36%)",
              boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
            },
          }}
        >
          Assign Territory
        </Button>
      </Card>

      <Box
        component={motion.div}
        variants={containerVariants}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, minmax(0, 1fr))",
          },
          gap: "14px",
          mb: 2,
          width: "100%",
        }}
      >
        {isLoading
          ? Array.from(new Array(6)).map((_, index) => (
              <Card
                key={index}
                elevation={0}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "70px",
                  minHeight: "70px",
                  borderRadius: "10px",
                  border: "1px solid #e8ebf0",
                  background: "#ffffff",
                  boxShadow: "0px 3px 10px rgba(0,0,0,0.04)",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {/* NAME SKELETON */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "13px",
                    left: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={6}
                    height={6}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width={85}
                    height={16}
                    animation="wave"
                  />
                </Box>

                {/* NUMBER SKELETON */}
                <Skeleton
                  variant="text"
                  width={32}
                  height={30}
                  animation="wave"
                  sx={{
                    position: "absolute",
                    top: "6px",
                    right: "12px",
                  }}
                />

                {/* ASSIGNED SKELETON */}
                <Skeleton
                  variant="text"
                  width={42}
                  height={12}
                  animation="wave"
                  sx={{
                    position: "absolute",
                    top: "32px",
                    right: "11px",
                  }}
                />

                {/* PROGRESS SKELETON */}
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={{
                    position: "absolute",
                    left: "12px",
                    right: "12px",
                    bottom: "10px",
                    width: "auto",
                    height: "5px",
                    borderRadius: "10px",
                  }}
                />
              </Card>
            ))
          : territories.map((item) => (
              <Card
                component={motion.div}
                variants={itemVariants}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                key={item.name}
                elevation={0}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "70px",
                  minHeight: "70px",
                  borderRadius: "10px",
                  border: "1px solid #e8ebf0",
                  background: "#ffffff",
                  boxShadow: "0px 3px 10px rgba(0,0,0,0.04)",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  "& hover": {
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.07)",
                  },
                }}
              >
                {/* TERRITORY NAME */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "13px",
                    left: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    maxWidth: "calc(100% - 65px)",
                    minWidth: 0,
                  }}
                >
                  {/* COLOR DOT */}
                  <Box
                    sx={{
                      width: "6px",
                      height: "6px",
                      minWidth: "6px",
                      borderRadius: "50%",
                      backgroundColor: item.color,
                    }}
                  />

                  {/* NAME */}
                  <Typography
                    component="div"
                    sx={{
                      fontSize: "11px",
                      lineHeight: "14px",
                      fontWeight: 500,
                      color: "#263238",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>

                {/* ASSIGNED NUMBER */}
                <Typography
                  component="div"
                  sx={{
                    position: "absolute",
                    top: "9px",
                    right: "12px",
                    fontSize: "25px",
                    lineHeight: "25px",
                    fontWeight: 600,
                    letterSpacing: "-0.8px",
                    color: item.color,
                    fontFamily: "'Inter', 'Roboto', sans-serif",
                    fontFeatureSettings: '"tnum"',
                    m: 0,
                    p: 0,
                  }}
                >
                  <AnimatedCounter to={item.count} />
                </Typography>

                {/* ASSIGNED TEXT */}
                <Typography
                  component="div"
                  sx={{
                    position: "absolute",
                    top: "34px",
                    right: "12px",
                    fontSize: "8.5px",
                    lineHeight: "10px",
                    fontWeight: 500,
                    color: "#64748b",
                    m: 0,
                    p: 0,
                  }}
                >
                  assigned
                </Typography>

                {/* PROGRESS BAR BACKGROUND */}
                <Box
                  sx={{
                    position: "absolute",
                    left: "12px",
                    right: "12px",
                    bottom: "10px",
                    height: "5px",
                    borderRadius: "10px",
                    backgroundColor: "#e7eaf0",
                    overflow: "hidden",
                  }}
                >
                  {/* PROGRESS */}
                  <Box
                    sx={{
                      width: "70%",
                      height: "100%",
                      borderRadius: "10px",
                      backgroundColor: item.color,
                    }}
                  />
                </Box>
              </Card>
            ))}
      </Box>

      {/* Main Content Layout - Map and Sidebar */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* Left: Empty Map Area */}
        <Card
          component={motion.div}
          variants={itemVariants}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #edf0f4",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              height: 52,
              display: "flex",
              alignItems: "center",
              px: 2,
              gap: 1.5,
              borderBottom: "1px solid #edf0f4",
            }}
          >
            <Typography fontSize={14} fontWeight={700} mr={1}>
              Territory Map
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {["All", "Active", "Late", "Absent"].map((item, index) => (
                <Typography
                  key={item}
                  fontSize={11}
                  fontWeight={index === 0 ? 600 : 500}
                  sx={{
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 4,
                    background: index === 0 ? "#ef233c" : "transparent",
                    color: index === 0 ? "#fff" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 320,
              position: "relative",
            }}
          >
            <AreaAllocationMap employees={mapEmployees} />

            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                background: "#fff",
                borderRadius: 2,
                p: 1.2,
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              }}
            ></Box>
          </Box>
        </Card>

        {/* Right Sidebar */}
        <Box
          component={motion.div}
          variants={containerVariants}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Card 1: Map Prompt */}
          <Card
            variants={itemVariants}
            elevation={0}
            sx={{
              height: 140,
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: "#ffffff",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Box sx={{ mb: 1.5 }}>
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </Box>
            <Typography
              fontSize={15}
              color="#64748b"
              textAlign="center"
              fontWeight={400}
              lineHeight={1.4}
            >
              Select a zone on the <br /> map to view details
            </Typography>
          </Card>

          {/* Card 2: Field Crew List */}
          <Card
            variants={itemVariants}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.02)",
              maxHeight: 340,
              overflowY: "auto",
              background: "#ffffff",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2.5,
                py: 2,
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Typography fontSize={13.5} fontWeight={600} color="#1e293b">
                Field Crew
              </Typography>
              {isLoading ? (
                <Skeleton
                  variant="text"
                  width={55}
                  height={14}
                  animation="wave"
                />
              ) : (
                <Typography fontSize={11.5} color="#64748b">
                  {crewData.length > 0 ? (
                    <AnimatedCounter to={crewData.length} />
                  ) : (
                    "0"
                  )}{" "}
                  tracked
                </Typography>
              )}
            </Box>

            {/* List Section */}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {isLoading ? (
                Array.from(new Array(4)).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: index !== 3 ? "1px solid #f8fafc" : "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flex: 1,
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={34}
                        height={34}
                        animation="wave"
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={15}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width="40%"
                          height={12}
                          animation="wave"
                          sx={{ mt: 0.2 }}
                        />
                      </Box>
                    </Box>
                    <Skeleton
                      variant="text"
                      width={35}
                      height={14}
                      animation="wave"
                    />
                  </Box>
                ))
              ) : crewData.length === 0 ? (
                <Typography
                  fontSize={12}
                  color="#94a3b8"
                  textAlign="center"
                  py={4}
                >
                  No crew data available.
                </Typography>
              ) : (
                crewData.map((person, index) => (
                  <Box
                    key={person.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      px: 2.5,
                      py: 1.5,
                      borderBottom:
                        index !== crewData.length - 1
                          ? "1px solid #f8fafc"
                          : "none",
                    }}
                  >
                    {/* Left Side: Avatar + Text */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {/* Avatar Section */}
                      <Box sx={{ position: "relative" }}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: 12,
                            fontWeight: 700,
                            background: person.color,
                            color: "#fff",
                          }}
                        >
                          {person.initials}
                        </Avatar>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: person.color,
                            border: "2px solid #fff",
                          }}
                        />
                      </Box>

                      {/* Name & Role Section */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.1,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          fontSize="16px"
                          fontWeight={600}
                          color="#1e293b"
                          noWrap
                        >
                          {person.name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <svg
                            width="10"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>

                          <Typography
                            fontSize="14px"
                            color="#94a3b8"
                            fontWeight={500}
                            noWrap
                          >
                            {person.role}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Right Side: Status Label */}
                    <Typography
                      fontSize={11.5}
                      color="#64748b"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {person.statusLabel}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Card>

          {/* Card 3: AI Insights */}
          {/* <Card
            variants={itemVariants}
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 4,
              border: "1px solid #f3e8ff",
              background: "#faf5ff",
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}
            >
              <Box
                sx={{
                  background: "#9333ea",
                  color: "#fff",
                  borderRadius: 2,
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                AI
              </Box>
              <Typography
                fontSize={16}
                fontWeight={700}
                color="#7e22ce"
                letterSpacing="-0.3px"
              >
                AI Insights
              </Typography>
            </Box>
            {isLoading ? (
              <Box>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={16}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={16}
                  animation="wave"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <Typography
                  color="#9333ea"
                  fontSize={18}
                  lineHeight={0.9}
                  mt={0.2}
                >
                  •
                </Typography>
                <Typography
                  fontSize={13}
                  lineHeight={1.4}
                  color="#9333ea"
                  fontWeight={400}
                >
                  {apiSummary ? apiSummary.active : 0} out of{" "}
                  {apiSummary ? apiSummary.total : 0} employees are currently
                  active. Off-duty counts are currently at{" "}
                  {apiSummary ? apiSummary.offDuty : 0}.
                </Typography>
              </Box>
            )}
          </Card> */}
        </Box>
      </Box>

      {/* =========================================
          INTEGRATED MODAL COMPONENT
      ========================================= */}
      <AssignTerritoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

export default AreaAllocation;
