import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Tooltip,
  Collapse,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";

import brandLogo from "../../assets/Logo1.png";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";


/* =========================================================
   MODULE CONFIGURATION
   Backend gives moduleName.
   Frontend decides icon + route for modules without children.
========================================================= */

const moduleConfig = {
  Dashboard: {
    icon: <DashboardRoundedIcon />,
    path: "/dashboard",
  },

  "User Management": {
    icon: <PeopleAltOutlinedIcon />,
  },

  Recruitment: {
    icon: <PeopleAltOutlinedIcon />,
    path: "/Recruitment",
  },

  Onboarding: {
    icon: <PeopleAltOutlinedIcon />,
    path: "/Onboarding",
  },

  Employees: {
    icon: <BadgeOutlinedIcon />,
  },

  Attendance: {
    icon: <AccessTimeOutlinedIcon />,
  },

  Payroll: {
    icon: <PeopleAltOutlinedIcon />,
    path: "/Payroll",
  },

  Reports: {
    icon: <AssessmentOutlinedIcon />,
  },

  Settings: {
    icon: <SettingsRoundedIcon />,
  },
};


/* =========================================================
   SUBMODULE ROUTES
   Backend gives submoduleName.
   Frontend maps that name to its React route.
========================================================= */

const submoduleConfig = {
  // User Management
  "Company Information": {
    path: "/company-info",
    title: "Company Information",
  },

  "Organization Structure": {
    path: "/organization-chart",
    title: "Organization Structure",
  },

  "Departments & Branches": {
    path: "/Departments",
    title: "Departments & Branches",
  },

  // Employees
  "Employee-Directory": {
    path: "/Employee-Directory",
    title: "Employee Directory",
  },

  "Bank-Verification": {
    path: "/Bank-Verification",
    title: "Bank Verification",
  },

  "Asset-Allocation": {
    path: "/Asset-Allocation",
    title: "Asset Allocation",
  },

  "ID-Card-Generator": {
    path: "/ID-Card-Generator",
    title: "ID Card Generator",
  },

  // Attendance
  "Attendance-management": {
    path: "/Attendance-management",
    title: "Attendance Management",
  },

  "Shift-Management": {
    path: "/Shift-Management",
    title: "Shift Management",
  },

  "Leave-Management": {
    path: "/Leave-Management",
    title: "Leave Management",
  },

  "Area-Allocation": {
    path: "/Area-Allocation",
    title: "Area Allocation",
  },

  // Settings
  "System-User": {
    path: "/System-User",
    title: "System User",
  },
  "Attendance-Report": {
    path: "/Attendance-Report",
    title: "Attendance Report",
  },

  "Permission": {
    path: "/Permission",
    title: "Permission",
  },
};


/* =========================================================
   DYNAMIC SIDEBAR FUNCTION
========================================================= */

const getDynamicSidebarItems = (permissionData) => {
  /*
    Expected API structure:

    [
      {
        modules_submodule: [
          {
            moduleId: 1,
            moduleName: "Dashboard",
            selectedSubmodules: []
          }
        ]
      }
    ]
  */

  const modules = permissionData?.[0]?.modules_submodule || [];

  return modules
    .map((module) => {
      const config = moduleConfig[module.moduleName];

      /*
        If backend sends a module which is not configured
        on frontend, don't show broken menu.
      */

      if (!config) {
        console.warn(
          `Sidebar module "${module.moduleName}" is not configured in moduleConfig`
        );

        return null;
      }


      /* ---------------------------------------------
         Convert selectedSubmodules into sidebar children
      --------------------------------------------- */

      const children = (module.selectedSubmodules || [])
        .map((submodule) => {
          const path = submoduleConfig[submodule.submoduleName];

          /*
            If backend sends a new submodule but route
            is not configured yet, ignore it.
          */

          if (!path) {
            console.warn(
              `Sidebar submodule "${submodule.submoduleName}" is not configured in submoduleConfig`
            );

            return null;
          }

          return {
            title: submodule.submoduleName,
            path: path.path,
            submoduleId: submodule.submoduleId,
            selectedActions: submodule.selectedActions || [],
          };
        })
        .filter(Boolean);


      return {
        title: module.moduleName,
        icon: config.icon,

        /*
          If module has children, path is not required.
          If module has no children, config.path is used.
        */

        path: config.path,

        children: children,

        moduleId: module.moduleId,
      };
    })
    .filter(Boolean);
};


/* =========================================================
   WIDTH
========================================================= */

const COLLAPSED_WIDTH = 88;
const EXPANDED_WIDTH = 260;


/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

export default function Sidebar() {

  const [isHovered, setIsHovered] = useState(false);

  const [openSubmenu, setOpenSubmenu] = useState({});

  const location = useLocation();


  /* =======================================================
     GET PERMISSION RESPONSE FROM LOCAL STORAGE
  ======================================================= */

  const permissionData = useMemo(() => {
    try {
      const storedPermissions =
        localStorage.getItem("permissions");

      if (!storedPermissions) {
        return [];
      }

      return JSON.parse(storedPermissions);

    } catch (error) {

      console.error(
        "Error parsing sidebar permissions:",
        error
      );

      return [];
    }
  }, []);


  /* =======================================================
     CREATE DYNAMIC SIDEBAR
  ======================================================= */

  const sidebarItems = useMemo(() => {

    return getDynamicSidebarItems(permissionData);

  }, [permissionData]);


  /* =======================================================
     AUTOMATICALLY OPEN ACTIVE SUBMENU
  ======================================================= */

  useEffect(() => {

    const activeSubmenus = {};

    sidebarItems.forEach((item) => {

      if (item.children?.length > 0) {

        const isChildActive = item.children.some(
          (child) => location.pathname === child.path
        );

        if (isChildActive) {
          activeSubmenus[item.title] = true;
        }
      }

    });

    setOpenSubmenu((prev) => ({
      ...prev,
      ...activeSubmenus,
    }));

  }, [location.pathname, sidebarItems]);


  /* =======================================================
     SUBMENU TOGGLE
  ======================================================= */

  const handleSubmenuToggle = (title) => {

    /*
      If sidebar is collapsed and user clicks
      parent menu, expand sidebar first.
    */

    if (!isHovered) {
      setIsHovered(true);
    }

    setOpenSubmenu((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <Box
      component={motion.div}

      onMouseEnter={() => setIsHovered(true)}

      onMouseLeave={() => {
        setIsHovered(false);
        setOpenSubmenu({});
      }}

      animate={{
        width: isHovered
          ? EXPANDED_WIDTH
          : COLLAPSED_WIDTH,
      }}

      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
      }}

      sx={{
        height: "calc(100vh - 90px)",

        background:
          "linear-gradient(135deg, #0A2B22 0%, #0C3328 50%, #0B2E24 100%)",

        borderTopRightRadius: 28,
        borderBottomRightRadius: 28,

        color: "#fff",

        display: "flex",
        flexDirection: "column",

        position: "fixed",

        top: 60,

        zIndex: 1200,

        boxShadow:
          "8px 0 32px rgba(0, 0, 0, 0.25)",

        overflow: "hidden",

        willChange: "width",
      }}
    >


      {/* =================================================
          BRAND HEADER
      ================================================= */}

      <Box
        sx={{
          px: 2.5,

          display: "flex",
          alignItems: "center",

          gap: 2,

          minHeight: 88,
        }}
      >

        {/* LOGO */}

        <Box
          component="img"

          src={brandLogo}

          alt="Brand Logo"

          sx={{
            width: 44,
            height: 44,

            minWidth: 44,

            objectFit: "contain",

            borderRadius: "8px",

            cursor: "pointer",

            padding: "2px",
          }}
        />


        {/* BRAND TEXT */}

        <AnimatePresence>

          {isHovered && (

            <Box
              component={motion.div}

              initial={{
                opacity: 0,
                x: -10,
              }}

              animate={{
                opacity: 1,
                x: 0,
              }}

              exit={{
                opacity: 0,
                x: -10,
              }}

              transition={{
                duration: 0.2,
              }}

              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >

              <Typography
                fontWeight={700}
                letterSpacing={0.3}

                sx={{
                  fontSize: ".9em",
                }}
              >
                ProParamedics
              </Typography>


              <Typography
                color="rgba(255,255,255,0.55)"

                sx={{
                  fontSize: ".9em",
                }}
              >
                Workforce Console
              </Typography>

            </Box>

          )}

        </AnimatePresence>

      </Box>


      <Divider
        sx={{
          borderColor:
            "rgba(255,255,255,0.08)",

          mx: 2,
        }}
      />


      {/* =================================================
          NAVIGATION MENU
      ================================================= */}

      <Box
        sx={{
          flex: 1,

          overflowY: "auto",

          px: 2,

          py: 2.5,

          "&::-webkit-scrollbar": {
            width: 4,
          },

          "&::-webkit-scrollbar-thumb": {
            bgcolor:
              "rgba(255,255,255,0.12)",

            borderRadius: 2,
          },
        }}
      >


        {/* =================================================
            DYNAMIC SIDEBAR ITEMS
        ================================================= */}

        {sidebarItems.map((item, index) => {

          const hasChildren =
            item.children &&
            item.children.length > 0;


          /* ---------------------------------------------
             Check if child is active
          --------------------------------------------- */

          const isChildActive = hasChildren
            ? item.children.some(
              (child) =>
                location.pathname === child.path
            )
            : false;


          /* ---------------------------------------------
             Check submenu open
          --------------------------------------------- */

          const isSubmenuOpen =
            !!openSubmenu[item.title];


          /* =================================================
             MENU ITEM RENDER FUNCTION
          ================================================= */

          const renderMenuItem = (
            isActiveOverride = false
          ) => {

            const isActive =
              isActiveOverride ||
              isChildActive;


            return (

              <Box
                component={motion.div}

                whileHover={{
                  scale: 1.01,

                  x: isHovered
                    ? 2
                    : 0,
                }}

                whileTap={{
                  scale: 0.98,
                }}

                onClick={() => {

                  if (hasChildren) {

                    handleSubmenuToggle(
                      item.title
                    );

                  }

                }}

                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}

                sx={{
                  position: "relative",

                  display: "flex",
                  alignItems: "center",

                  height: 48,

                  borderRadius: 3,

                  px: 1,

                  cursor: "pointer",

                  bgcolor: isActive
                    ? "rgba(32, 128, 93, 0.35)"
                    : isSubmenuOpen
                      ? "rgba(255, 255, 255, 0.05)"
                      : "transparent",

                  border: isActive
                    ? "1px solid rgba(116, 255, 210, 0.2)"
                    : "1px solid transparent",

                  backdropFilter: isActive
                    ? "blur(8px)"
                    : "none",

                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(32, 128, 93, 0.45)"
                      : "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >


                {/* =========================================
                    ACTIVE INDICATOR
                ========================================= */}

                {isActive && (

                  <Box
                    component={motion.div}

                    layoutId="sidebarActivePill"

                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}

                    sx={{
                      position: "absolute",

                      left: 0,

                      top: 10,

                      bottom: 10,

                      width: 4,

                      borderRadius:
                        "0 4px 4px 0",

                      bgcolor: "#ef4444",

                      boxShadow:
                        "0 0 10px rgba(239, 68, 68, 0.8)",
                    }}
                  />

                )}


                {/* =========================================
                    ICON
                ========================================= */}

                <Box
                  sx={{
                    width: 36,
                    height: 36,

                    minWidth: 36,

                    borderRadius: 2.5,

                    bgcolor: isActive
                      ? "#13664a"
                      : "rgba(255,255,255,0.05)",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    color: isActive
                      ? "#74ffd2"
                      : "rgba(255,255,255,0.65)",

                    transition:
                      "all 0.2s ease",

                    boxShadow: isActive
                      ? "0 2px 12px rgba(19, 102, 74, 0.5)"
                      : "none",
                  }}
                >

                  {item.icon}

                </Box>


                {/* =========================================
                    LABEL + ARROW
                ========================================= */}

                <AnimatePresence>

                  {isHovered && (

                    <Box
                      component={motion.div}

                      initial={{
                        opacity: 0,
                        x: -8,
                      }}

                      animate={{
                        opacity: 1,
                        x: 0,
                      }}

                      exit={{
                        opacity: 0,
                        x: -8,
                      }}

                      transition={{
                        duration: 0.15,
                      }}

                      sx={{
                        ml: 2,

                        display: "flex",

                        alignItems: "center",

                        justifyContent:
                          "space-between",

                        width: "100%",

                        pr: 1,
                      }}
                    >

                      <Typography
                        sx={{
                          whiteSpace: "nowrap",

                          color: isActive
                            ? "#fff"
                            : "rgba(255,255,255,0.75)",

                          fontWeight: isActive
                            ? 600
                            : 500,

                          fontSize: ".8em",
                        }}
                      >

                        {item.title}

                      </Typography>


                      {/* ARROW */}

                      {hasChildren && (

                        <Box
                          component={motion.div}

                          animate={{
                            rotate:
                              isSubmenuOpen
                                ? 180
                                : 0,
                          }}

                          transition={{
                            duration: 0.2,
                          }}

                          sx={{
                            display: "flex",

                            color:
                              "rgba(255,255,255,0.4)",
                          }}
                        >

                          <KeyboardArrowDownRoundedIcon
                            fontSize="small"
                          />

                        </Box>

                      )}

                    </Box>

                  )}

                </AnimatePresence>

              </Box>
            );
          };


          /* =================================================
             RETURN MENU
          ================================================= */

          return (

            <Box
              key={
                item.moduleId ||
                `${item.title}-${index}`
              }

              sx={{
                mb: 1,
              }}
            >


              {/* =================================================
                  MODULE WITHOUT CHILDREN
              ================================================= */}

              {!hasChildren ? (

                <NavLink
                  to={item.path || "#"}
                  style={{
                    textDecoration: "none",
                    display: "block",
                  }}
                >

                  {({ isActive }) => (

                    !isHovered ? (

                      <Tooltip
                        title={item.title}
                        placement="right"
                        arrow
                      >

                        {renderMenuItem(
                          isActive
                        )}

                      </Tooltip>

                    ) : (

                      renderMenuItem(
                        isActive
                      )

                    )

                  )}

                </NavLink>

              ) : (


                /* =================================================
                   MODULE WITH CHILDREN
                ================================================= */

                <>

                  {!isHovered ? (

                    <Tooltip
                      title={item.title}
                      placement="right"
                      arrow
                    >

                      {renderMenuItem()}

                    </Tooltip>

                  ) : (

                    renderMenuItem()

                  )}


                  {/* =================================================
                      SUBMENU
                  ================================================= */}

                  {isHovered && (

                    <Collapse
                      in={isSubmenuOpen}
                      timeout="auto"
                      unmountOnExit
                    >

                      <Box
                        sx={{
                          ml: 2.5,

                          mt: 1,

                          mb: 0.5,

                          pl: 1.5,

                          borderLeft:
                            "2px solid rgba(116, 255, 210, 0.15)",

                          display: "flex",

                          flexDirection:
                            "column",

                          gap: 0.5,

                          position:
                            "relative",
                        }}
                      >


                        {/* =================================================
                            DYNAMIC CHILDREN
                        ================================================= */}

                        {item.children.map(
                          (
                            child,
                            childIdx
                          ) => (

                            <NavLink
                              key={
                                child.submoduleId ||
                                childIdx
                              }

                              to={child.path}

                              style={{
                                textDecoration:
                                  "none",
                              }}
                            >

                              {({
                                isActive,
                              }) => (

                                <Box
                                  component={
                                    motion.div
                                  }

                                  whileHover={{
                                    x: 4,
                                  }}

                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                  }}

                                  sx={{
                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    py: 0.9,

                                    px: 1.5,

                                    borderRadius:
                                      2,

                                    bgcolor:
                                      isActive
                                        ? "rgba(116, 255, 210, 0.12)"
                                        : "transparent",

                                    color:
                                      isActive
                                        ? "#74ffd2"
                                        : "rgba(255,255,255,0.65)",

                                    transition:
                                      "all 0.2s ease",

                                    border:
                                      isActive
                                        ? "1px solid rgba(116, 255, 210, 0.2)"
                                        : "1px solid transparent",

                                    "&:hover":
                                    {
                                      bgcolor:
                                        isActive
                                          ? "rgba(116, 255, 210, 0.18)"
                                          : "rgba(255,255,255,0.06)",

                                      color:
                                        "#fff",
                                    },
                                  }}
                                >


                                  {/* =====================================
                                      CHILD DOT
                                  ===================================== */}

                                  <FiberManualRecordIcon
                                    sx={{
                                      fontSize:
                                        isActive
                                          ? 8
                                          : 6,

                                      mr: 1.5,

                                      color:
                                        isActive
                                          ? "#74ffd2"
                                          : "rgba(255,255,255,0.3)",

                                      filter:
                                        isActive
                                          ? "drop-shadow(0 0 6px #74ffd2)"
                                          : "none",

                                      transition:
                                        "all 0.2s ease",
                                    }}
                                  />


                                  {/* =====================================
                                      CHILD LABEL
                                  ===================================== */}

                                  <Typography
                                    fontWeight={
                                      isActive
                                        ? 600
                                        : 400
                                    }

                                    sx={{
                                      whiteSpace:
                                        "nowrap",

                                      fontSize:
                                        ".8em",
                                    }}
                                  >

                                    {
                                      child.title
                                    }

                                  </Typography>

                                </Box>

                              )}

                            </NavLink>

                          )
                        )}

                      </Box>

                    </Collapse>

                  )}

                </>

              )}

            </Box>

          );

        })}


        {/* =================================================
            NO PERMISSION MESSAGE
        ================================================= */}

        {sidebarItems.length === 0 && (

          <Typography
            sx={{
              color:
                "rgba(255,255,255,0.5)",

              fontSize: ".8rem",

              textAlign: "center",

              mt: 3,
            }}
          >
            No menu available
          </Typography>

        )}

      </Box>

    </Box>
  );
}