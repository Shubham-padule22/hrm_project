import { useState, useEffect } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import "@fontsource/oxanium";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

import loginBg from "../../assets/loginback.png";
import logo from "../../assets/loginproparalogo.png";
import sperologo from "../../assets/spero.png";

import { loginSchema } from "./loginSchema";
import axiosInstance from "../../Config/axiosInstance";

// --------------------------------------------------
// RIGHT PANEL ANIMATION
// --------------------------------------------------

const rightPanelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 90,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// --------------------------------------------------
// FORM ITEM ANIMATION
// --------------------------------------------------

const formItemVariants = {
  hidden: { y: 30, opacity: 0, filter: "blur(4px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 60, duration: 0.5 },
  },
};

// --------------------------------------------------
// LOGIN COMPONENT
// --------------------------------------------------

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Refresh animation
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Captcha
  const [captchaId, setCaptchaId] = useState("");
  const [captchaData, setCaptchaData] = useState("");

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // --------------------------------------------------
  // FORM (Added setValue here)
  // --------------------------------------------------
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // --------------------------------------------------
  // CAPTCHA API
  // --------------------------------------------------
  const refreshCaptcha = async () => {
    setIsRotating(true);
    setRotation((prev) => prev + 360);

    // YAHAN CAPTCHA TEXTFIELD CLEAR HOGA
    setValue("captcha", "");

    try {
      const response = await axiosInstance.post("/hrm_web/generate_captcha");
      setCaptchaId(response.data.captcha_id);
      setCaptchaData(
        response.data.captcha_image || response.data.captcha_base64 || "",
      );
    } catch (error) {
      console.error("Failed to fetch captcha", error);
    } finally {
      setTimeout(() => {
        setIsRotating(false);
      }, 700);
    }
  };

  useEffect(() => {
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
const onSubmit = async (data, eventOrOverride) => {
  const wantToLoginOverride = eventOrOverride === true;

  setLoading(true);
  setLoginError("");
  setLoginSuccess("");

  try {
    // 1. VERIFY CAPTCHA
    if (!wantToLoginOverride) {
      await axiosInstance.post("/hrm_web/verify_captcha", {
        captcha_id: captchaId,
        captcha_value: data.captcha,
      });
    }

    // 2. LOGIN API
    const response = await axiosInstance.post("/hrm_web/login/", {
      clg_ref_id: data.username,
      password: data.password,
      want_to_login: wantToLoginOverride,
    });

    const resData = response.data;

    // =====================================================
    // ALREADY LOGGED IN CHECK (200 OK ke andar MSG check)
    // =====================================================
    if (resData?.msg === "User Already Logged In. Please check.") {
      setLoading(false);
      // Pehle UI pe Message dikhao
      setLoginError(resData?.msg);

      // 600ms ruko taaki framer-motion animation complete ho jaye, fir popup dikhao
      setTimeout(() => {
        Swal.fire({
          title: "Session Already Active",
          text: "This account is already logged in on another session. Do you want to log in here anyway?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#E62E3C",
          cancelButtonColor: "rgba(255,255,255,0.1)",
          confirmButtonText: "Force Login",
          background: "#0d1b15",
          color: "#ffffff",
          backdrop: `rgba(0,0,0,0.7)`,
        }).then((result) => {
          if (result.isConfirmed) {
            onSubmit(data, true);
          } else {
            setLoginError("");
            refreshCaptcha();
          }
        });
      }, 600);
      return;
    }

    // =====================================================
    // LOGIN SUCCESS
    // =====================================================
    if (response.status === 200 || response.status === 201) {
      const tokenData = resData?.token;
      const colleague = tokenData?.colleague;

      if (!tokenData?.access) {
        setLoginError("Access token not received from server.");
        setLoading(false);
        refreshCaptcha();
        return;
      }

      // --- 1. SET TOKENS ---
      localStorage.setItem("token", tokenData.access);
      localStorage.setItem("refresh_token", tokenData.refresh || "");

      // --- 2. SET PERMISSIONS (JSON.stringify use karke) ---
      if (tokenData?.permissions) {
        localStorage.setItem(
          "permissions",
          JSON.stringify(tokenData.permissions),
        );
      }

      // --- 3. SET COLLEAGUE DATA ---
      if (colleague) {
        localStorage.setItem("emp_id", String(colleague.id ?? ""));
        localStorage.setItem("clg_ref_id", colleague.clg_ref_id || "");
        localStorage.setItem("log_id", String(colleague.log_id ?? ""));
        localStorage.setItem("first_name", colleague.first_name || "");
        localStorage.setItem("last_name", colleague.last_name || "");
        localStorage.setItem("email", colleague.email || "");
        localStorage.setItem("phone_no", colleague.phone_no || "");
        localStorage.setItem("emp_type", colleague.emp_type || "");
        localStorage.setItem(
          "organization_id",
          String(colleague.organization_id ?? ""),
        );
        localStorage.setItem(
          "organization_name",
          colleague.organization_name || "",
        );
        localStorage.setItem("branch_id", String(colleague.branch_id ?? ""));
        localStorage.setItem("branch_name", colleague.branch_name || "");
        localStorage.setItem("colleague", JSON.stringify(colleague));
        localStorage.setItem("shift_name", colleague.shift_name || "");
        localStorage.setItem(
          "shift_start_time",
          colleague.shift_start_time || "",
        );
        localStorage.setItem(
          "shift_end_time",
          colleague.shift_end_time || "",
        );
      }

      setLoginSuccess(resData?.msg || "Logged in Successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

      return;
    }

    setLoginError(resData?.msg || "Login failed. Please try again.");
    setLoading(false);
  } catch (err) {
    console.error("Login Error:", err);
    setLoading(false);

    if (err.response && err.config?.url?.includes("verify_captcha")) {
      setLoginError("Invalid Captcha. Please try again.");
      refreshCaptcha();
      return;
    }

    if (err.response) {
      const errorMsg =
        err.response.data?.msg ||
        err.response.data?.message ||
        err.response.data?.detail;

      // =====================================================
      // ALREADY LOGGED IN CHECK (CATCH BLOCK - 409 Conflict)
      // =====================================================
      if (
        err.response.status === 409 ||
        errorMsg === "User Already Logged In. Please check."
      ) {
        // Pehle UI pe error dikhao
        setLoginError(errorMsg || "User Already Logged In.");

        // Fir timeout ke baad popup
        setTimeout(() => {
          Swal.fire({
            title: "Session Already Active",
            text: "This account is already logged in on another session. Do you want to log in here anyway?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E62E3C",
            cancelButtonColor: "rgba(255,255,255,0.1)",
            confirmButtonText: "Force Login",
            background: "#0d1b15",
            color: "#ffffff",
            backdrop: `rgba(0,0,0,0.7)`,
          }).then((result) => {
            if (result.isConfirmed) {
              onSubmit(data, true);
            } else {
              setLoginError("");
              refreshCaptcha();
            }
          });
        }, 600);
        return;
      }

      setLoginError(errorMsg || "Invalid credentials. Please try again.");
      return;
    }

    setLoginError("Network error. Please check your connection.");
  }
};

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
      }}
    >
      {/* ================================================= */}
      {/* LEFT SECTION */}
      {/* ================================================= */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50, filter: "blur(15px)", scale: 0.95 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { md: 4, lg: 8 },
          mt: "-40vh",
          color: "#fff",
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {"SPERO Workforce".split("").map((char, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 35,
                  filter: "blur(12px)",
                  scale: 0.85,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  scale: 1,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              style={{
                display: "inline-block",
                fontFamily: "Oxanium, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(3rem, 5.5vw, 5rem)",
                letterSpacing: "4px",
                background:
                  "linear-gradient(180deg, #FFFFFF 20%, #A0B0BA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.6))",
                lineHeight: 1.1,
                marginRight: char === " " ? "12px" : "0px",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      </Box>

      {/* ================================================= */}
      {/* RIGHT PANEL */}
      {/* ================================================= */}
      <Box
        component={motion.div}
        variants={rightPanelVariants}
        initial="hidden"
        animate="visible"
        sx={{
          width: { xs: "100%", md: "400px", lg: "440px" },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "transparant",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "-15px 0 50px rgba(0,0,0,0.6)",
          px: { xs: 3, md: 4 },
          py: 3,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          {/* LOGO */}
          <Box
            textAlign="center"
            mb={1}
            mt={0.5}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              src={logo}
              alt="logo"
              width="160px"
              style={{ cursor: "pointer", display: "block" }}
            />
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                letterSpacing: "-1px",
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                letterSpacing: "3px",
                filter: "blur(0px)",
              }}
              transition={{
                duration: 2.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.8,
              }}
            >
              <Typography
                sx={{
                  fontWeight: "600",
                  fontSize: "1.45rem",
                  mt: 1,
                  // fontFamily: "Oxanium, sans-serif",
                  textTransform: "uppercase",
                  background: "#FFFFFF",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.4))",
                  textAlign: "center",
                }}
              >
                User Login
              </Typography>
            </motion.div>

            {/* LOGIN FORM */}
            <Stack
              spacing={2.5}
              component="form"
              onSubmit={(e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                handleSubmit(onSubmit)(e);
              }}
              sx={{ width: "100%" }}
            >
              {/* USERNAME */}
              <motion.div variants={formItemVariants}>
                <Box sx={{ color: "#fff", textAlign: "left", width: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      mb: 0.5,
                      color: "rgba(255,255,255,0.78)",
                    }}
                  >
                    Username
                  </Typography>
                  <TextField
                    size="medium"
                    fullWidth
                    placeholder="Enter Username"
                    {...register("username")}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "5px",
                                bgcolor: "#175A44", // Light green background
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PersonOutlineOutlinedIcon
                                sx={{
                                  color: "#34D097", // Green icon
                                  fontSize: 20,
                                }}
                              />
                            </Box>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={textfieldStyle}
                  />
                </Box>
              </motion.div>

              {/* PASSWORD */}
              <motion.div variants={formItemVariants}>
                <Box sx={{ color: "#fff", textAlign: "left", width: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      mb: 0.5,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.78)",
                    }}
                  >
                    Password
                  </Typography>

                  <TextField
                    size="medium"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "5px",
                                bgcolor: "#175A44",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <LockOutlinedIcon
                                sx={{
                                  color: "#34D097",
                                  fontSize: 20,
                                }}
                              />
                            </Box>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                              sx={{ color: "#fff" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={textfieldStyle}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                      gap: 0.8,
                    }}
                  >
                    <AdminPanelSettingsOutlinedIcon
                      sx={{ fontSize: 15, color: "rgba(255,255,255,0.85)" }}
                    />
                    <Typography
                      sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}
                    >
                      Password is case-sensitive
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* CAPTCHA */}
              <motion.div variants={formItemVariants}>
                <Box sx={{ color: "#fff", textAlign: "left", width: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      mb: 0.5,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.78)",
                    }}
                  >
                    Captcha
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.7}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Enter Captcha"
                      {...register("captcha")}
                      error={!!errors.captcha}
                      helperText={errors.captcha?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "5px",
                                  bgcolor: "#175A44",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ShieldOutlinedIcon
                                  sx={{
                                    color: "#34D097",
                                    fontSize: 20,
                                  }}
                                />
                              </Box>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ ...textfieldStyle, flex: 1, minWidth: 0 }}
                    />
                    <motion.div
                      animate={{ rotate: rotation }}
                      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        type="button"
                        onClick={refreshCaptcha}
                        disabled={isRotating}
                        sx={{
                          width: 34,
                          height: 34,
                          p: 0,
                          borderRadius: "50%",
                          color: "rgba(255,255,255,0.65)",
                          background: "rgba(255,255,255,0.035)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          transition: "all 0.25s ease",
                          "&:hover": {
                            color: "#34D097",
                            background: "rgba(52,208,151,0.10)",
                            borderColor: "rgba(52,208,151,0.35)",
                            boxShadow: "0 0 15px rgba(52,208,151,0.2)",
                            transform: "scale(1.08)",
                          },
                          "&:active": { transform: "scale(0.92)" },
                          "&.Mui-disabled": {
                            color: "rgba(255,255,255,0.35)",
                            background: "rgba(255,255,255,0.025)",
                          },
                        }}
                      >
                        <RefreshIcon sx={{ fontSize: 19 }} />
                      </IconButton>
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={captchaId || "loading"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            width: "92px",
                            minWidth: "92px",
                            height: "34px",
                            borderRadius: "4px",
                            background:
                              "linear-gradient(180deg, rgba(30,45,60,0.85) 0%, rgba(15,25,35,0.95) 100%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.4)",
                            userSelect: "none",
                          }}
                        >
                          {captchaData ? (
                            <img
                              src={
                                captchaData.includes("data:image")
                                  ? captchaData
                                  : `data:image/png;base64,${captchaData}`
                              }
                              alt="captcha"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                imageRendering: "pixelated",
                                filter: "contrast(1.2) brightness(0.9)",
                              }}
                            />
                          ) : (
                            "..."
                          )}
                        </Box>
                      </motion.div>
                    </AnimatePresence>
                  </Stack>
                </Box>
              </motion.div>

              {/* LOGIN ERROR */}
              <AnimatePresence mode="wait">
                {loginError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -6,
                      scale: 0.98,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -6,
                      scale: 0.98,
                      filter: "blur(4px)",
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        width: "100%",
                        maxWidth: "280px",
                        background:
                          "linear-gradient(90deg, rgba(230,46,60,0.15) 0%, rgba(230,46,60,0.05) 100%)",
                        border: "1px solid rgba(230,46,60,0.2)",
                        borderLeft: "3px solid #E62E3C",
                        borderRadius: "8px",
                        px: 2,
                        py: 1,
                        mt: 1,
                        boxShadow: "0 4px 15px rgba(230,46,60,0.1)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.25,
                          delay: 0.05,
                          ease: "easeOut",
                        }}
                      >
                        <ErrorOutlineIcon
                          sx={{
                            color: "#ff4d4d",
                            fontSize: 20,
                            display: "block",
                          }}
                        />
                      </motion.div>
                      <Typography
                        sx={{
                          color: "#ff4d4d",
                          fontSize: "12px",
                          fontWeight: 500,
                          letterSpacing: "0.5px",
                          textAlign: "left",
                          lineHeight: 1.4,
                        }}
                      >
                        {loginError}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LOGIN SUCCESS */}
              <AnimatePresence>
                {loginSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        width: "100%",
                        maxWidth: "280px",
                        background:
                          "linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderLeft: "3px solid #10b981",
                        borderRadius: "8px",
                        px: 2,
                        py: 1,
                        mt: 1,
                        boxShadow: "0 4px 15px rgba(16,185,129,0.1)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <CheckCircleOutlineIcon
                        sx={{ color: "#10b981", fontSize: 20 }}
                      />
                      <Typography
                        sx={{
                          color: "#10b981",
                          fontSize: "12px",
                          fontWeight: 500,
                          letterSpacing: "0.5px",
                          textAlign: "left",
                        }}
                      >
                        {loginSuccess}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LOGIN BUTTON */}
              <motion.div
                variants={formItemVariants}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "2rem",
                  paddingBottom: "10px",
                }}
              >
                <Button
                  component={motion.button}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 10px 30px rgba(239,51,64,0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  sx={{
                    width: "100%",
                    maxWidth: "220px",
                    minHeight: "36px",
                    py: 0.7,
                    fontWeight: 600,
                    fontSize: "1rem",
                    letterSpacing: "0.5px",
                    textTransform: "none",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
                    boxShadow: "0 6px 20px 0 rgba(220, 31, 48, 0.32)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "background 0.4s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #D42A36 0%, #A81F29 100%)",
                    },
                  }}
                >
                  {loading ? "Authenticating..." : "Login"}
                </Button>
              </motion.div>
            </Stack>

            <motion.div
              variants={formItemVariants}
              style={{
                display: "flex",
                justifyContent: "center",
                paddingBottom: "10px",
              }}
            >
              <motion.img
                whileHover={{ opacity: 1, scale: 1.03 }}
                initial={{ opacity: 0.6 }}
                src={sperologo}
                alt="spero logo"
                width={90}
                style={{ cursor: "pointer", transition: "0.4s ease" }}
              />
            </motion.div>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const iconWrapperStyle = {
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  background: "#164A33",
  border: "none",
  flexShrink: 0,
  zIndex: 1,
};

const textfieldStyle = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    height: "38px",
    // borderRadius: "6px",
    // background: "rgba(255,255,255,0.38)",
    borderRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(255, 255, 255, 0.37)",
    paddingLeft: "3px",
    "& fieldset": { border: "none" },
    "& .MuiInputAdornment-root": { marginRight: "8px" },
    // "& :hover": { background: "rgba(255,255,255,0.45)" },
    "&.Mui-focused": {
      // background: "rgba(255,255,255,0.48)",
      boxShadow: "0 0 0 1px rgba(52,208,151,0.35)",
    },
  },
  "& .MuiInputBase-input": {
    color: "#fff",
    fontSize: "1rem",
    padding: "8px 0px",
    "&::placeholder": {
      color: "rgba(255,255,255,0.7)",
      opacity: 1,
      fontSize: ".7rem",
    },
  },
};
