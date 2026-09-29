import React from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const CustomBreadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split("/").filter(Boolean);

  const formatLabel = (value) => {
    return decodeURIComponent(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /*
   * Dynamic breadcrumb items
   */
  const breadcrumbItems = [];

  pathnames.forEach((segment, index) => {
    const path = "/" + pathnames.slice(0, index + 1).join("/");

    const isLast = index === pathnames.length - 1;

    /*
     * Agar last segment Employee ID hai
     * to usko Employee Profile dikhao
     */
    const isEmployeeId = /^EMP\d+$/i.test(segment);

    let label = formatLabel(segment);

    if (isEmployeeId) {
      label = "Employee Profile";
    }

    breadcrumbItems.push({
      path,
      label,
      isLast,
    });
  });

  return (
    <Breadcrumbs
      separator="›"
      aria-label="breadcrumb"
      sx={{
        mb: 1,
        px: 0.3,

        "& .MuiBreadcrumbs-separator": {
          color: "#B7BDC4",
          fontSize: 22, // Arrow ko thoda bada aur clear kiya
          fontWeight: 400,
          mx: 1.5, // ✅ Gap badhane ke liye mx (margin left/right) ko 1 se 1.5 kiya
          mt: "-3px", // ✅ Text ke sath vertically center align karne ke liye
        },
      }}
    >
      {/* ================= HOME ================= */}

      <Link
        component="button"
        underline="none"
        onClick={() => navigate("/dashboard")}
        sx={{
          border: 0,
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 15,
          color: "#7D8792",

          "&:hover": {
            color: "#073F35",
          },
        }}
      >
        Home
      </Link>

      {/* ================= DYNAMIC PATH ================= */}

      {breadcrumbItems.map((item) => {
        /*
         * Last breadcrumb current page hai,
         * isliye clickable nahi hoga.
         */
        if (item.isLast) {
          return (
            <Typography
              key={item.path}
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: "#27313C",
              }}
            >
              {item.label}
            </Typography>
          );
        }

        /*
         * Previous breadcrumb clickable hoga
         */
        return (
          <Link
            key={item.path}
            component="button"
            underline="none"
            onClick={() => navigate(item.path)}
            sx={{
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 15,
              color: "#7D8792",

              "&:hover": {
                color: "#073F35",
              },
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default CustomBreadcrumbs;
