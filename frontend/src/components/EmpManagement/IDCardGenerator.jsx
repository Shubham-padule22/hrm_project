import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

import {
  Box,
  Typography,
  TextField,
  Avatar,
  Button,
  Checkbox,
  Divider,
  Paper,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import {
  Search,
  PrintOutlined,
  DownloadOutlined,
  DoneAll,
} from "@mui/icons-material";

import axiosInstance from "../../Config/axiosInstance";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import { hasPermission } from "../common/permissionUtils";

// Sirf Barcode library import ki hai (QR hata diya)
import Barcode from "react-barcode";

/* =========================================================
   CONFIG
========================================================= */

const CARD_WIDTH = 340;
const CARD_HEIGHT = 195;

const API_HOST = "http://192.168.1.37";


/* ---------------------------------------------------------
   MAPPER
--------------------------------------------------------- */
function mapApiEmployeeToCard(raw) {
  if (!raw) return null;

  const firstName = raw.clg_first_name || "";
  const midName = raw.clg_mid_name || "";
  const lastName = raw.clg_last_name || "";
  const fullName =
    [firstName, midName, lastName].filter(Boolean).join(" ") || "Unknown";

  const initials =
    ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "NA";

  const cardId =
    raw.clg_id != null
      ? `EMP${String(raw.clg_id).padStart(3, "0")}`
      : raw.clg_ref_id || "N/A";

  const doc = raw.profile;
  const isRealPhoto =
    doc?.document_type_details?.document_type === "Photo" && doc?.document_url;
  const photoUrl = isRealPhoto ? `${API_HOST}${doc.document_url}` : null;

  return {
    rawId: raw.clg_id,
    id: cardId,
    name: fullName,
    department: raw.clg_designation || "N/A",
    role: raw.clg_designation || "N/A",
    location: raw.branch != null ? `Branch ${raw.branch}` : "N/A",
    initials,
    bloodType: raw.clg_blood_type || "N/A",
    emergencyContact: raw.clg_eme_contact_number || "N/A",
    license: raw.clg_license_number || "N/A",
    photoUrl,
  };
}

/* ---------------------------------------------------------
   HOOKS
--------------------------------------------------------- */
function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchEmployees() {
      try {
        const response = await axiosInstance.get(
          "/hrm_web/employee_registretion/",
        );
        const data = response.data;
        const rawList = Array.isArray(data)
          ? data
          : data.results || data.data || [];

        if (!cancelled) {
          setEmployees(rawList.map(mapApiEmployeeToCard).filter(Boolean));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setEmployees([]);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch employees",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  return { employees, loading, error };
}

function useEmployeeDetail(rawId) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rawId == null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    axiosInstance
      .get(`/hrm_web/employee_registretion/${rawId}/`)
      .then(({ data }) => {
        if (!cancelled) setDetail(mapApiEmployeeToCard(data));
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rawId]);

  return { detail, loading };
}

function usePrintQueue() {
  const [printQueue, setPrintQueue] = useState([]);
  const prevTitle = useRef(document.title);

  useEffect(() => {
    if (printQueue.length === 0) return;

    prevTitle.current = document.title;
    document.title =
      printQueue.length === 1
        ? `ID-Card-${printQueue[0].id}`
        : `ID-Cards-Batch-${printQueue.length}`;

    const timer = setTimeout(() => {
      window.print();
    }, 150);

    const handleAfterPrint = () => {
      document.title = prevTitle.current;
      setPrintQueue([]);
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printQueue]);

  return { printQueue, setPrintQueue };
}

/* =========================================================
   PRINT AREA (PRINTER FORMATTING)
========================================================= */
function PrintArea({ employees }) {
  if (!employees.length) return null;
  return (
    <Box className="print-area">
      {employees.map((employee, index) => (
        <Box
          key={employee.id}
          className="card-container" /* PREVENTS CARD CUTTING IN HALF */
          sx={{
            pageBreakAfter: index < employees.length - 1 ? "always" : "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <FrontCardContent employee={employee} />
            <BackCardContent employee={employee} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* =========================================================
   PREMIUM 3D TILT WRAPPER
========================================================= */

function TiltCard({ children, sx, px, py, isHovering }) {
  const rotateX = useSpring(useTransform(py, [0, 1], [18, -18]), {
    stiffness: 400,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-18, 18]), {
    stiffness: 400,
    damping: 25,
  });

  const swipeShine = useMotionTemplate`linear-gradient(
    110deg,
    transparent ${useTransform(px, [0, 1], [-60, 80])}%,
    rgba(255, 255, 255, 0.05) ${useTransform(px, [0, 1], [-45, 95])}%,
    rgba(255, 255, 255, 0.6) ${useTransform(px, [0, 1], [-30, 110])}%,
    rgba(255, 255, 255, 0.05) ${useTransform(px, [0, 1], [-15, 125])}%,
    transparent ${useTransform(px, [0, 1], [0, 140])}%
  )`;

  const ambientGlow = useMotionTemplate`radial-gradient(
    circle at ${useTransform(px, [0, 1], ["0%", "100%"])} ${useTransform(
      py,
      [0, 1],
      ["0%", "100%"],
    )},
    rgba(255, 255, 255, 0.3) 0%,
    transparent 60%
  )`;

  const visibility = useSpring(isHovering ? 1 : 0, {
    stiffness: 300,
    damping: 25,
  });

  const boxShadow = isHovering
    ? "0 25px 40px -10px rgba(0,0,0,0.4), 0 15px 20px -15px rgba(0,0,0,0.2)"
    : "0 10px 20px -5px rgba(0,0,0,0.2)";

  return (
    <Box
      sx={{
        perspective: 1200,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        boxSizing: "border-box",
        ...sx,
      }}
    >
      <motion.div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          boxSizing: "border-box",
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          position: "relative",
          borderRadius: 16,
          boxShadow: boxShadow,
          transition: "box-shadow 0.4s ease",
        }}
      >
        {children}

        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: ambientGlow,
            opacity: visibility,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            zIndex: 10,
          }}
        />

        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: swipeShine,
            opacity: visibility,
            pointerEvents: "none",
            zIndex: 11,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "16px",
            pointerEvents: "none",
            boxShadow:
              "inset 0 1.5px 2px rgba(255,255,255,0.7), inset 0 -1.5px 2px rgba(0,0,0,0.4), inset 1px 0 1px rgba(255,255,255,0.2), inset -1px 0 1px rgba(0,0,0,0.2)",
            zIndex: 12,
          }}
        />
      </motion.div>
    </Box>
  );
}

function CardStage({ children, sx }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
    setIsHovering(false);
  };

  return (
    <Box
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      sx={{ cursor: "pointer", ...sx }}
    >
      {typeof children === "function"
        ? children({ px, py, isHovering })
        : children}
    </Box>
  );
}

/* =========================================================
   EMPLOYEE LIST
========================================================= */

function EmployeeList({
  employees,
  selected,
  setSelected,
  search,
  setSearch,
  loading,
  selectedEmployees,
  onToggleSelect,
}) {
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        height: "calc(100vh - 110px)",
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 16,
        alignSelf: "flex-start",
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#333", mb: 1 }}>
        Search Employees
      </Typography>

      <TextField
        fullWidth
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search sx={{ fontSize: 18, color: "#777" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          flexShrink: 0,
          "& .MuiOutlinedInput-root": {
            height: 42,
            borderRadius: "8px",
            bgcolor: "#fff",
            fontSize: 13,
          },
        }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={22} sx={{ color: "#0a4b3e" }} />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
           
          }}
        >
          {filteredEmployees.map((employee, index) => {
            const active = selected?.id === employee.id;
            const checked = selectedEmployees.includes(employee.id);

            return (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={employee.id}
                onClick={() => setSelected(employee)}
                sx={{
                  p: 1.2,
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: active ? "#eff9f6" : "#fff",
                  border: active
                    ? "1.5px solid #80a99f"
                    : "1.5px solid #edf0f0",
                  boxShadow: active
                    ? "0 4px 10px rgba(8,60,50,.08)"
                    : "0 2px 4px rgba(0,0,0,.02)",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Checkbox
                  size="small"
                  checked={checked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => onToggleSelect(employee.id)}
                  sx={{
                    p: 0.4,
                    color: "#c3cbc8",
                    "&.Mui-checked": { color: "#0a4b3e" },
                  }}
                />

                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#083e34",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {employee.initials}
                </Avatar>

                <Box sx={{ minWidth: 0, ml: 0.6 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {employee.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#78817f", mt: 0.3 }}>
                    {employee.id} · {employee.department}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/* =========================================================
   FRONT CARD
========================================================= */

function FrontCardContent({ employee }) {
  return (
    <Box
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        boxSizing: "border-box",
        borderRadius: "16px",
        position: "relative",
        overflow: "hidden",
        background: `
          linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%),
          radial-gradient(circle at 90% 10%, #126350 0%, transparent 60%),
          linear-gradient(135deg, #123d35 0%, #075b48 58%, #032b22 100%)
        `,
        color: "#fff",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: 175,
          height: 4,
          bgcolor: "#ed1837",
          zIndex: 5,
        },
      }}
    >
      <Box sx={{ p: 2, position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 0.5,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Proparamedics
            </Typography>
            <Typography sx={{ fontSize: 9, color: "#a9c4be", mt: 0.3 }}>
              Non-Emergency Medical Transport
            </Typography>
          </Box>

          <Box
            sx={{
              width: 66,
              height: 66,
              borderRadius: "8px",
              bgcolor: "#fff",
              p: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            {employee.photoUrl ? (
              <Box
                component="img"
                src={employee.photoUrl}
                alt={employee.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            ) : (
              <Typography
                sx={{ fontSize: 22, fontWeight: 800, color: "#083c32" }}
              >
                {employee.initials}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 1.8, display: "flex", alignItems: "center", gap: 1.2 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 14,
              bgcolor: "#416b61",
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            {employee.initials}
          </Avatar>
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {employee.name}
          </Typography>
        </Box>

        <Box sx={{ ml: 5.7, mt: 0.4 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
            {employee.role}
          </Typography>
          <Typography sx={{ fontSize: 9, color: "#b7ccc7", mt: 0.3 }}>
            {employee.department} - {employee.location}
          </Typography>
        </Box>

        <Divider
          sx={{ mt: 2.2, mb: 1.2, borderColor: "rgba(255,255,255,.15)" }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>
            {employee.id}
          </Typography>
          <Typography sx={{ fontSize: 10, color: "#b7ccc7", fontWeight: 600 }}>
            Valid through Dec 2025
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* =========================================================
   BACK CARD (ONLY 1D BARCODE WITH SCALING FIX)
========================================================= */

function BackCardContent({ employee }) {
  const barcodeDetails = `${employee.id}-${employee.name}-${employee.role}`;

  return (
    <Box
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        boxSizing: "border-box",
        borderRadius: "16px",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#fdfdfd",
        borderTop: "4px solid #ed1837",
        p: 2,
        backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
        backgroundSize: "12px 12px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 18,
          left: 0,
          right: 0,
          px: 4, // Prevents barcode from touching edges
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "& svg": {
            maxWidth: "100%", // 🚀 This fixes the overflow issue!
            height: "35px !important",
          },
        }}
      >
        <Barcode
          value={barcodeDetails}
          width={1.2}
          height={35}
          displayValue={false}
          background="transparent"
          lineColor="#172039"
          margin={0}
        />
        <Typography
          sx={{
            fontSize: 8,
            color: "#4e5960",
            mt: 0.4,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {employee.id}-{employee.initials}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 82,
          left: 16,
          right: 16,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 0.8,
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: 10, color: "#555", mb: 0.4, fontWeight: 600 }}
          >
            Blood Type:
          </Typography>
          <Typography
            sx={{ fontSize: 10, color: "#555", mb: 0.4, fontWeight: 600 }}
          >
            Emergency Contact:
          </Typography>
          <Typography sx={{ fontSize: 10, color: "#555", fontWeight: 600 }}>
            License:
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{ fontSize: 10, fontWeight: 800, mb: 0.4, color: "#111" }}
          >
            {employee.bloodType || "—"}
          </Typography>
          <Typography
            sx={{ fontSize: 10, fontWeight: 800, mb: 0.4, color: "#111" }}
          >
            {employee.emergencyContact || "—"}
          </Typography>
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#111" }}>
            {employee.license || "—"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: "absolute", left: 16, bottom: 16 }}>
        <Typography
          sx={{
            fontSize: 8,
            color: "#66736f",
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Proparamedics
          <br />
          200 W Madison St.
          <br />
          Chicago, IL 60606
          <br />
          +1 (312) 555-0100 · nemtcare.com
        </Typography>
      </Box>
    </Box>
  );
}

/* =========================================================
   BATCH PRINT & MAIN APP
========================================================= */

function BatchPrint({
  employees,
  selectedEmployees,
  setSelectedEmployees,
  onPrintSelected,
  onDownloadSelected,
  canDownloadAllIdCards
}) {
  const allSelected =
    employees.length > 0 && selectedEmployees.length === employees.length;
  const toggleSelectAll = () =>
    setSelectedEmployees(allSelected ? [] : employees.map((e) => e.id));

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        border: "1.5px solid #edf0f0",
        borderRadius: "12px",
        p: 2,
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#56615e" }}>
          Batch Actions
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: "#78817f" }}>
            {selectedEmployees.length} selected
          </Typography>
          <Button
            size="small"
            startIcon={<DoneAll sx={{ fontSize: 16 }} />}
            onClick={toggleSelectAll}
            sx={{ fontSize: 11, textTransform: "none", color: "#0a4b3e" }}
          >
            {allSelected ? "Clear all" : "Select all"}
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintOutlined />}
          fullWidth
          disabled={selectedEmployees.length === 0}
          onClick={onPrintSelected}
          sx={{
            height: 38,
            borderRadius: "10px",
            textTransform: "none",
            fontSize: 12,
            color: "#56615e",
            borderColor: "#ced4d2",
          }}
        >
          Print Selected
        </Button>
       {canDownloadAllIdCards && (<Button
          variant="contained"
          startIcon={<DownloadOutlined />}
          fullWidth
          disabled={selectedEmployees.length === 0}
          onClick={onDownloadSelected}
          sx={{
            height: 38,
            borderRadius: "10px",
            textTransform: "none",
            fontSize: 12,
            bgcolor: "#ed1d3b",
            "&:hover": { bgcolor: "#d81734" },
          }}
        >
          Download All (PDF)
        </Button>)}
      </Box>
      {selectedEmployees.length === 0 && (
        <Typography sx={{ fontSize: 10.5, color: "#a3aba8", mt: 1 }}>
          Tick employees in the list on the left to enable batch printing.
        </Typography>
      )}
    </Paper>
  );
}

export default function IDCardGenerator() {
  const canDownloadIdCard = hasPermission(
  "Employees",
  "ID-Card-Generator",
  "Download"
);

const canDownloadAllIdCards = hasPermission(
  "Employees",
  "ID-Card-Generator",
  "Download-All"
);
  const { employees, loading, error } = useEmployees();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const { printQueue, setPrintQueue } = usePrintQueue();

  useEffect(() => {
    if (!selected && employees.length) setSelected(employees[0]);
  }, [employees, selected]);

  const { detail } = useEmployeeDetail(selected?.rawId);
  const displayedEmployee = detail || selected;

  const toggleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handlePrintOrDownloadCurrent = () => {
    if (displayedEmployee) setPrintQueue([displayedEmployee]);
  };
  const handlePrintOrDownloadSelected = () => {
    const toPrint = employees.filter((e) => selectedEmployees.includes(e.id));
    if (toPrint.length) setPrintQueue(toPrint);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        color: "#26332f",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* 🚀 FIXED CSS FOR EXACT PRINTER STYLING */}
      <style>{`
        @media print {
          body * { 
            visibility: hidden; 
          }
          .print-area, .print-area * { 
            visibility: visible !important; 
          }
          .print-area { 
            display: block !important; 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .card-container {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page { 
            margin: 10mm; 
            size: auto;
          }
        }
        .print-area { display: none; }
      `}</style>

      <PrintArea employees={printQueue} />

      <Box sx={{ minHeight: "calc(100vh - 63px)", pb: 4 }}>
        <Box component={motion.div} sx={{ ml: 2 }}>
          <CustomBreadcrumbs />
        </Box>

        {/* --- MAIN LOADER SECTION --- */}
        {loading && employees.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "70vh",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CircularProgress
                size={50}
                thickness={4}
                sx={{ color: "#0a4b3e", mb: 2 }}
              />
            </motion.div>
            <Typography
              component={motion.p}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              sx={{
                fontSize: 16,
                fontWeight: 600,
                color: "#56615e",
                letterSpacing: 0.5,
              }}
            >
              Loading Employee Cards...
            </Typography>
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <Typography
              sx={{ color: "#ed1d3b", fontSize: 16, fontWeight: 600 }}
            >
              {error}
            </Typography>
          </Box>
        ) : (
          /* --- MAIN CONTENT --- */
          <Box
            sx={{
              px: 2,
              pt: 2,
              display: "flex",
              gap: 3,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <Box>
              <EmployeeList
                employees={employees}
                loading={loading}
                selected={selected}
                setSelected={(e) => setSelected(e)}
                search={search}
                setSearch={setSearch}
                selectedEmployees={selectedEmployees}
                onToggleSelect={toggleSelectEmployee}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: "#56615e" }}
                >
                  ID Card Preview
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    startIcon={<PrintOutlined />}
                    disabled={!displayedEmployee}
                    onClick={handlePrintOrDownloadCurrent}
                    sx={{
                      fontSize: 11,
                      height: 32,
                      color: "#65706c",
                      textTransform: "none",
                    }}
                  >
                    Print
                  </Button>
                 {(canDownloadIdCard && <Button
                    variant="contained"
                    startIcon={<DownloadOutlined />}
                    disabled={!displayedEmployee}
                    onClick={handlePrintOrDownloadCurrent}
                    sx={{
                      fontSize: 11,
                      height: 32,
                      px: 1.5,
                      borderRadius: "8px",
                      bgcolor: "#073d34",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#052e28" },
                    }}
                  >
                    Download PDF
                  </Button>)}
                </Box>
              </Box>

              {displayedEmployee && (
                <CardStage
                  sx={{
                    minHeight: CARD_HEIGHT + 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    flexWrap: "wrap",
                  }}
                >
                  {({ px, py, isHovering }) => (
                    <AnimatePresence mode="wait">
                      <Box
                        component={motion.div}
                        key={`front-${displayedEmployee.id}`}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -15 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                      >
                        <TiltCard px={px} py={py} isHovering={isHovering}>
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              position: "relative",
                            }}
                          >
                            <FrontCardContent employee={displayedEmployee} />
                          </Box>
                        </TiltCard>
                      </Box>

                      <Box
                        component={motion.div}
                        key={`back-${displayedEmployee.id}`}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -15 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.05,
                        }}
                      >
                        <TiltCard px={px} py={py} isHovering={isHovering}>
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              position: "relative",
                            }}
                          >
                            <BackCardContent employee={displayedEmployee} />
                          </Box>
                        </TiltCard>
                      </Box>
                    </AnimatePresence>
                  )}
                </CardStage>
              )}
              <BatchPrint
                employees={employees}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
                onPrintSelected={handlePrintOrDownloadSelected}
                onDownloadSelected={handlePrintOrDownloadSelected}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
