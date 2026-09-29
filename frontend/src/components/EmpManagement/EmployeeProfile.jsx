import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,

  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";

import QrCode2Icon from "@mui/icons-material/QrCode2";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import { useParams } from "react-router-dom";

import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import axiosInstance from "../../Config/axiosInstance";

/* =========================================================
   FRAMER MOTION VARIANTS
========================================================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 24,
    },
  },
};

const fadeDownVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const statsContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const statsItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

/* =========================================================
   INFO FIELD
========================================================= */

const InfoField = ({ label, value }) => {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 9.5,
          fontWeight: 600,
          color: "#344054",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Box
        component={motion.div}
        whileHover={{
          backgroundColor: "#F1F3F5",
        }}
        transition={{
          duration: 0.2,
        }}
        sx={{
          height: 36,
          borderRadius: "6px",
          background: "#F8F9FA",
          border: "1px solid #E8EAED",
          display: "flex",
          alignItems: "center",
          px: 1.2,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            color: "#667085",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  );
};

/* =========================================================
   TIMELINE ITEM
========================================================= */

const TimelineItem = ({ title, date, color = "#0B6658", last = false }) => {
  return (
    <Box
      component={motion.div}
      variants={fadeUpVariants}
      sx={{
        position: "relative",
        display: "flex",
        gap: 1,
        pb: last ? 0 : 2,
      }}
    >
      {!last && (
        <Box
          component={motion.div}
          initial={{
            height: 0,
          }}
          animate={{
            height: "calc(100% - 1px)",
          }}
          transition={{
            duration: 0.5,
            delay: 0.5,
          }}
          sx={{
            position: "absolute",
            left: 3,
            top: 9,
            width: "1px",
            background: "#D8E1DE",
          }}
        />
      )}

      <Box
        component={motion.div}
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          type: "spring",
          bounce: 0.5,
          delay: 0.4,
        }}
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          mt: 0.35,
          zIndex: 1,
        }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 9,
            fontWeight: 700,
            color: "#263238",
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 7.8,
            color: "#9AA1A9",
            mt: 0.3,
          }}
        >
          {date}
        </Typography>
      </Box>
    </Box>
  );
};

/* =========================================================
   EMPLOYEE PROFILE
========================================================= */

export default function EmployeeProfile() {
  const { employeeId } = useParams();

  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================================================
     FETCH EMPLOYEE DATA
  ========================================================= */

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Route param ID
        const idToFetch = employeeId || "94";

        console.log("Fetching Employee ID:", idToFetch);

        const response = await axiosInstance.get(
          `/hrm_web/employee_registretion/${idToFetch}/`,
        );

        const data = response.data;

        console.log("EMPLOYEE API RESPONSE:", data);

        /* =====================================================
           FULL NAME
        ===================================================== */

        const fullName = [
          data.clg_first_name,
          data.clg_mid_name,
          data.clg_last_name,
        ]
          .filter(Boolean)
          .join(" ");

        /* =====================================================
           STATUS
        ===================================================== */

        const employeeStatus =
          data.clg_is_active === 1 || data.clg_is_active === "1"
            ? "Active"
            : "Inactive";

        /* =====================================================
           PROFILE PHOTO
        ===================================================== */

        let profilePhoto = null;

        if (data.profile?.document_url) {
          profilePhoto = data.profile.document_url;
        }

        /* =====================================================
           SET EMPLOYEE DATA
        ===================================================== */

        setEmp({
          /* -----------------------------
             Basic Information
          ----------------------------- */

          id: data.clg_id ? `EMP${data.clg_id}` : `EMP${idToFetch}`,

          name: fullName || "Unknown Name",

          email: data.clg_email || "No Email",

          phone: data.clg_mobile_no || "-",

          photo: profilePhoto,

          /* -----------------------------
             Employment Information
          ----------------------------- */

          department:
            data.department_name ||
            data.Department_name ||
            data.department ||
            "-",

          role: data.clg_designation || "-",

          branch: data.branch_name || data.Branch_name || data.branch || "-",

          type: data.clg_employment_type || "-",

          status: employeeStatus,

          joined: data.clg_joining_date || "-",

          /* -----------------------------
             Personal Information
          ----------------------------- */

          dob: data.clg_dob || "-",

          gender: data.clg_gender || "-",

          nationality: data.clg_country || "-",

          bloodType: data.clg_blood_type || "-",

          maritalStatus: data.clg_marital_status || "-",

          /* -----------------------------
             Professional Information
          ----------------------------- */

          salary: data.clg_salary || data.salary || "-",

          license: data.clg_license_number || "N/A",

          manager:
            data.manager_name || data.manager || data.clg_senior || "N/A",

          licenseExpiry: data.clg_license_expiry || data.license_expiry || "-",

          /* -----------------------------
             Additional Information
          ----------------------------- */

          qualification: data.clg_qualification || "-",

          university: data.clg_university || "-",

          specialization: data.clg_specialization || "-",

          experience: data.clg_total_experience || "-",
        });

        setError(null);
      } catch (err) {
        console.error("Employee API Fetch Error:", err);

        console.error("Error Response:", err.response?.data);

        setError(
          err.response?.data?.message ||
            "Failed to load employee data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F5F7FA",
        }}
      >
        <CircularProgress sx={{ color: "#125B4D" }} />
      </Box>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F5F7FA",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography
          color="error"
          fontWeight={600}
          sx={{
            fontSize: 14,
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  /* =========================================================
     EMPTY DATA
  ========================================================= */

  if (!emp) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F5F7FA",
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            color: "#667085",
          }}
        >
          No employee data found.
        </Typography>
      </Box>
    );
  }

  /* =========================================================
     INITIALS
  ========================================================= */

  const initials = emp.name
    ? emp.name
        .split(" ")
        .filter(Boolean)
        .map((item) => item[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "NA";

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        minHeight: "100vh",
        background: "#F5F7FA",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#1F2937",
        px: {
          xs: 1,
          sm: 1.5,
          md: 1.5,
        },
        py: {
          xs: 1,
          sm: 1.2,
        },
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          BREADCRUMBS
      ===================================================== */}

      <Box component={motion.div} variants={fadeDownVariants}>
        <CustomBreadcrumbs />
      </Box>

      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <Paper
        component={motion.div}
        variants={fadeDownVariants}
        elevation={0}
        sx={{
          background:
            "linear-gradient(105deg, #064638 0%, #125B4D 55%, #216C5C 100%)",
          borderRadius: "9px",
          minHeight: {
            xs: 125,
            sm: 122,
            md: 118,
          },
          p: {
            xs: 1.2,
            sm: 1.4,
          },
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          mb: 1.2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* PROFILE INFORMATION */}

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.2,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Avatar
                component={motion.div}
                whileHover={{
                  scale: 1.05,
                }}
                src={emp.photo || undefined}
                sx={{
                  width: 43,
                  height: 43,
                  borderRadius: "8px",
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.35)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {!emp.photo && initials}
              </Avatar>

              <Box
                component={motion.div}
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  delay: 0.6,
                }}
                sx={{
                  position: "absolute",
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#20D9A0",
                  right: -1,
                  bottom: -1,
                  border: "1px solid #fff",
                }}
              />
            </Box>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 13,
                    sm: 14,
                  },
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {emp.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 8.5,
                  color: "rgba(255,255,255,.75)",
                  mt: 0.35,
                }}
              >
                {emp.role} · {emp.department}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  mt: 0.7,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 7.5,
                    color: "rgba(255,255,255,.75)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                  }}
                >
                  <LocationOnOutlinedIcon
                    sx={{
                      fontSize: 10,
                    }}
                  />

                  {emp.branch}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 7.5,
                    color: "rgba(255,255,255,.75)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                  }}
                >
                  <EmailOutlinedIcon
                    sx={{
                      fontSize: 10,
                    }}
                  />

                  {emp.email}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 7.5,
                    color: "rgba(255,255,255,.75)",
                  }}
                >
                  Joined {emp.joined}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* QR */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.4,
              flexShrink: 0,
            }}
          >
            <Box
              component={motion.div}
              whileHover={{
                rotate: 5,
                scale: 1.05,
              }}
              sx={{
                width: 51,
                height: 51,
                background: "#fff",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#123F36",
                cursor: "pointer",
              }}
            >
              <QrCode2Icon
                sx={{
                  fontSize: 42,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: 6.5,
                color: "rgba(255,255,255,.7)",
              }}
            >
              {emp.id}
            </Typography>
          </Box>
        </Box>

        {/* =====================================================
            HEADER STATS
        ===================================================== */}

        <Box
          component={motion.div}
          variants={statsContainerVariants}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(100px, 1fr))",
              sm: "repeat(5, minmax(100px, 1fr))",
            },
            gap: 1,
            mt: 1.1,
            maxWidth: {
              xs: "100%",
              sm: "82%",
            },
          }}
        >
          {[
            ["Employee ID", emp.id],
            ["Annual Salary", emp.salary],
            ["License", emp.license],
            ["Manager", emp.manager],
            ["Status", emp.status],
          ].map(([label, value]) => (
            <Box
              component={motion.div}
              variants={statsItemVariants}
              key={label}
              sx={{
                height: 34,
                borderRadius: "7px",
                background: "rgba(255,255,255,.10)",
                border: "1px solid rgba(255,255,255,.08)",
                px: 1.1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 6.8,
                  color: "rgba(255,255,255,.65)",
                }}
              >
                {label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <Box
        sx={{
          display: "grid",
      width: "100%",
          gap: 1.2,
          alignItems: "start",
        }}
      >
        {/* ===================================================
            LEFT CONTENT
        =================================================== */}

        <Box component={motion.div} variants={containerVariants}>
          {/* PERSONAL INFORMATION */}

          <Paper
            component={motion.div}
            variants={fadeUpVariants}
            whileHover={{
              y: -2,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
            elevation={0}
            sx={{
              border: "1px solid #E6E9ED",
              borderRadius: "8px",
              p: 1.3,
              mb: 1.2,
              background: "#fff",
              transition: "box-shadow 0.3s ease",
       
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#25313B",
                mb: 1.1,
              }}
            >
              Personal Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1.1,
              }}
            >
              <InfoField label="Full Name" value={emp.name} />

              <InfoField label="Employee ID" value={emp.id} />

              <InfoField label="Email" value={emp.email} />

              <InfoField label="Phone" value={emp.phone} />

              <InfoField label="Date of Birth" value={emp.dob} />

              <InfoField label="Gender" value={emp.gender} />

              <InfoField label="Nationality" value={emp.nationality} />

              <InfoField label="Blood Type" value={emp.bloodType} />
            </Box>
          </Paper>

          {/* EMPLOYMENT DETAILS */}

          <Paper
            component={motion.div}
            variants={fadeUpVariants}
            whileHover={{
              y: -2,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
            elevation={0}
            sx={{
              border: "1px solid #E6E9ED",
              borderRadius: "8px",
              p: 1.3,
              background: "#fff",
              transition: "box-shadow 0.3s ease",
              
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#25313B",
                mb: 1.1,
              }}
            >
              Employment Details
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1.1,
              }}
            >
              <InfoField label="Department" value={emp.department} />

              <InfoField label="Designation" value={emp.role} />

              <InfoField label="Branch" value={emp.branch} />

              <InfoField label="Employment Type" value={emp.type} />

              <InfoField label="Reporting Manager" value={emp.manager} />

              <InfoField label="Joined Date" value={emp.joined} />

              <InfoField label="Annual Salary" value={emp.salary} />

              <InfoField
                label="CDL License"
                value={`${emp.license} · Expires ${emp.licenseExpiry}`}
              />
            </Box>
          </Paper>
        </Box>

        {/* ===================================================
            RIGHT CONTENT
        =================================================== */}

        {/* <Box component={motion.div} variants={containerVariants}>
          {/* TIMELINE */}

          {/* <Paper
            component={motion.div}
            variants={fadeUpVariants}
            whileHover={{
              y: -2,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
            elevation={0}
            sx={{
              border: "1px solid #E6E9ED",
              borderRadius: "8px",
              p: 1.3,
              mb: 1.2,
              background: "#fff",
              transition: "box-shadow 0.3s ease",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#25313B",
                mb: 1.2,
              }}
            >
              Timeline
            </Typography>

            <Box component={motion.div} variants={containerVariants}>
              <TimelineItem
                title="Employee Profile Created"
                date={emp.joined || "-"}
                color="#09A981"
              />

              <TimelineItem
                title="Last Login"
                date={emp.lastLogin ? emp.lastLogin : "-"}
                color="#2868D8"
              />

              <TimelineItem
                title="Employee Status"
                date={emp.status}
                color="#7B35D8"
              />

              <TimelineItem
                title="Current Employee"
                date="Active Employee"
                color="#164B3E"
                last
              />
            </Box>
          </Paper> */}


          {/* <Paper
            component={motion.div}
            variants={fadeUpVariants}
            whileHover={{
              y: -2,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
            elevation={0}
            sx={{
              border: "1px solid #E6E9ED",
              borderRadius: "8px",
              p: 1.3,
              background: "#fff",
              transition: "box-shadow 0.3s ease",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#25313B",
                mb: 1.1,
              }}
            >
              License Expiry Alert
            </Typography>

            <Box
              sx={{
                border: "1px solid #FFC9CC",
                background: "#FFF1F2",
                borderRadius: "7px",
                p: 1.1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <WarningAmberOutlinedIcon
                  sx={{
                    fontSize: 15,
                    color: "#F04444",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#E12D39",
                  }}
                >
                  License Information
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: 7.8,
                  color: "#E12D39",
                  mt: 0.5,
                }}
              >
                {emp.license !== "N/A"
                  ? `${emp.license} License expires ${emp.licenseExpiry}`
                  : "No license information available"}
              </Typography>

              <Button
                component={motion.button}
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                fullWidth
                size="small"
                sx={{
                  mt: 1,
                  height: 18,
                  minHeight: 18,
                  borderRadius: "4px",
                  background: "#EF3340",
                  color: "#fff",
                  fontSize: 6.8,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    background: "#D92D39",
                  },
                }}
              >
                Initiate Renewal
              </Button>
            </Box>
          </Paper> */}
        {/* </Box> */} 
      </Box>
    </Box>
  );
}
