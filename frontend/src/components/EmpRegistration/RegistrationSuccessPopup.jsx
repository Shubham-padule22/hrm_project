import React from "react";
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
} from "@mui/material";
import { motion } from "framer-motion";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useNavigate } from "react-router-dom";
export default function RegistrationSuccessPopup({
    open,
    onClose,
}) {
    const navigate = useNavigate();
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 25px 80px rgba(15, 23, 42, 0.18)",
                },
            }}
        >
            <DialogContent
                sx={{
                    p: 4,
                    textAlign: "center",
                    background: "#FFFFFF",
                }}
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                >
                    <Box
                        sx={{
                            width: 76,
                            height: 76,
                            borderRadius: "50%",
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg, #0A3D31 0%, #00B884 100%)",
                            boxShadow:
                                "0 12px 30px rgba(0, 184, 132, 0.25)",
                        }}
                    >
                        <CheckRoundedIcon
                            sx={{
                                color: "#fff",
                                fontSize: 42,
                            }}
                        />
                    </Box>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <Typography
                        sx={{
                            mt: 2.5,
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#0F172A",
                        }}
                    >
                        Registration Successful!
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1,
                            fontSize: "0.85rem",
                            lineHeight: 1.6,
                            color: "#64748B",
                            px: 2,
                        }}
                    >
                        The employee has been successfully registered
                        and all details have been saved.
                    </Typography>
                </motion.div>

                {/* Button */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                            onClose();
                            navigate("/Employee-Directory");
                        }}
                        sx={{
                            mt: 3,
                            py: 1.2,
                            borderRadius: "12px",
                            textTransform: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            background:
                                "linear-gradient(135deg, #0A2B22 0%, #0C3328 50%, #0B2E24 100%)",
                            boxShadow:
                                "0 8px 20px rgba(10, 61, 49, 0.2)",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #08352A 0%, #115A47 100%)",
                            },
                        }}
                    >
                        Continue
                    </Button>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}