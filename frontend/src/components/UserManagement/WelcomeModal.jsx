import React from "react";
import { Dialog, DialogContent, Box, Typography, Button, Stack } from "@mui/material";

const WelcomeModal = ({ open, onStartTour, onSkip, logoSrc }) => {
    return (
        <Dialog
            open={open}
            onClose={onSkip}
            maxWidth="xs"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: "16px",
                    overflow: "hidden",
                    padding: 1,
                    backgroundColor: "#F3F4F6",
                    boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.15)",
                },
            }}
        >
            <DialogContent sx={{ p: 1, textAlign: "center" }}>
                {/* Logo Section */}
                {logoSrc && (
                    <Box
                        component="img"
                        src={logoSrc}
                        alt="Company Logo"
                        sx={{
                            height: 70,
                            objectFit: "contain",
                            mb: 1,
                        }}
                    />
                )}

                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                        fontSize: "1.5rem",
                        mb: 1.5,
                    }}
                >
                    Welcome to User Management
                </Typography>

                {/* Subtitle */}
                <Typography
                    variant="body1"
                    sx={{
                        color: "#526071",
                        fontWeight: 500,
                        fontSize: "1rem",
                        lineHeight: 1.4,
                        px: 2,
                        mb: 3.5,
                    }}
                >
                    Manage your team, roles and<br/> access—all in one place.
                </Typography>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="center">
                    {/* Skip Button */}
                    <Button
                        variant="outlined"
                        onClick={onSkip}
                        sx={{
                            flex: 1,
                            py: 1.2,
                            borderRadius: 2.5,
                            borderColor: "#D1D5DB",
                            color: "#4B5563",
                            backgroundColor: "#FFFFFF",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
                            "&:hover": {
                                backgroundColor: "#F9FAFB",
                                borderColor: "#9CA3AF",
                            },
                        }}
                    >
                        Skip
                    </Button>

                    {/* Take the Tour Button */}
                    <Button
                        variant="contained"
                        onClick={onStartTour}
                        disableElevation
                        sx={{
                            flex: 1.2,
                            py: 1.2,
                            borderRadius: 2.5,
                            backgroundColor: "#E63946", // Primary red button color
                            color: "#FFFFFF",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            boxShadow: "0px 4px 12px rgba(230, 57, 70, 0.35)",
                            "&:hover": {
                                backgroundColor: "#D62839",
                            },
                        }}
                    >
                        Take the Tour
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default WelcomeModal;