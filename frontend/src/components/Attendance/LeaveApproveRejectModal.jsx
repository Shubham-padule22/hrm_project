import React, { useState, useEffect } from "react";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Avatar,
    Chip,
    Button,
    Divider,
    TextField
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { API_BASE_URL } from "../../Config/api";
import axiosInstance from "../../Config/axiosInstance";
// import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { hasPermission } from "../common/permissionUtils";

export default function LeaveApproveRejectModal({ open, onClose, data, leaveId }) {
    const canApproveLeave = hasPermission(
        "Attendance",
        "Leave-Management",
        "Approve-Leave"
    );

    const canRejectLeave = hasPermission(
        "Attendance",
        "Leave-Management",
        "Reject-Leave"
    );

    const [showCommentInput, setShowCommentInput] = useState(false);
    const [comment, setComment] = useState("");

    const [leaveDetails, setLeaveDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLeaveRequestDetails = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(
                `${API_BASE_URL}/hrm_web/LeaveRequestWeb/`,
                {
                    params: {
                        leave_id: leaveId,
                    },
                }
            );

            console.log("Leave API Response:", response.data);

            setLeaveDetails(response.data);
        } catch (error) {
            console.error("Leave API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && leaveId) {
            getLeaveRequestDetails();
        }
    }, [open, leaveId]);
    // Sample or fallback data
    const leaveData = leaveDetails?.data
        ? {
            name: [
                leaveDetails.data.clg_first_name,
                leaveDetails.data.clg_mid_name,
                leaveDetails.data.clg_last_name,
            ]
                .filter(Boolean)
                .join(" "),

            department: leaveDetails.data.title || "-",

            employeeId: leaveDetails.data.clg_code || "-",

            appliedDate: leaveDetails.data.applied_date
                ? new Date(leaveDetails.data.applied_date).toLocaleDateString("en-GB")
                : "-",

            status:
                leaveDetails.data.status === 1
                    ? "Pending"
                    : leaveDetails.data.status === 2
                        ? "Approved"
                        : leaveDetails.data.status === 3
                            ? "Rejected"
                            : "-",

            fromDate: leaveDetails.data.from_date || "-",

            toDate: leaveDetails.data.to_date || "-",

            daysCount: leaveDetails.data.total_days || "0",

            leaveType: leaveDetails.data.leave_name || "-",

            reason: leaveDetails.data.reason || "-",

            activities: [],
        }
        : {
            name: "",
            department: "",
            employeeId: "",
            appliedDate: "",
            status: "Loading...",
            fromDate: "",
            toDate: "",
            daysCount: "",
            leaveType: "",
            reason: "",
            activities: [],
        };

    const getInitials = (name) => {
        if (!name) return "";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };


    const handleApprove = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                `${API_BASE_URL}/hrm_web/leave_approve/`,
                null,
                {
                    params: {
                        leave_id: leaveId,
                    },
                }
            );

            console.log("Leave Approved:", response.data);

            onClose();
        } catch (error) {
            console.error("Approve Leave Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                `${API_BASE_URL}/hrm_web/leave_reject/`,
                null,
                {
                    params: {
                        leave_id: leaveId,
                    },
                }
            );

            console.log("Leave Rejected:", response.data);

            onClose();
        } catch (error) {
            console.error("Reject Leave Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;

        try {
            setLoading(true);

            const response = await axiosInstance.post(
                `${API_BASE_URL}/hrm_web/add_comment/`,
                {
                    leave: leaveId,
                    comment: comment.trim(),
                }
            );

            console.log("Comment Added:", response.data);

            setComment("");
            setShowCommentInput(false);

            // Refresh leave details so the new comment is displayed
            getLeaveRequestDetails();
        } catch (error) {
            console.error("Add Comment Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    p: 0,
                    borderTopLeftRadius: "16px",
                    borderBottomLeftRadius: "16px",
                    boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
                },
            }}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "100vw", sm: "30vw" },
                        maxWidth: { xs: "100vw", sm: "30vw" },
                    },
                },
            }}
            ModalProps={{
                keepMounted: true,
                sx: {
                    zIndex: 3000,
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    bgcolor: "#FFFFFF",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: .5,
                        py: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #F2F4F7",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <IconButton size="small" onClick={onClose} sx={{ color: "#667085" }}>
                            <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.2vw", color: "#1D2939" }}>
                            Leave Request
                        </Typography>
                    </Box>
                    <Chip
                        label={leaveData.status}
                        sx={{
                            bgcolor: "#FEF0C7",
                            color: "#DC6803",
                            fontWeight: 600,
                            fontSize: "1vw",
                            height: "26px",
                            borderRadius: "16px",
                        }}
                    />
                </Box>

                {/* Scrollable Content */}
                <Box sx={{ flex: 1, overflowY: "auto", pl: 2, pr: 3, py: .5 }}>
                    {/* User Profile */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: "#144D37",
                                width: 25,
                                height: 25,
                                fontSize: ".9vw",
                                fontWeight: 600,
                            }}
                        >
                            {getInitials(leaveData.name)}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: ".9vw", color: "#101828" }}>
                                {leaveData.name}
                            </Typography>
                            <Typography sx={{ fontSize: ".8vw", color: "#667085" }}>
                                {leaveData.department} · {leaveData.employeeId}
                            </Typography>
                            <Typography sx={{ fontSize: ".8vw", color: "#98A2B3" }}>
                                Applied {leaveData.appliedDate}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 1.5, borderColor: "#F2F4F7" }} />

                    {/* Leave Details Card */}
                    <Typography
                        sx={{
                            fontSize: ".8vw",
                            fontWeight: 700,
                            color: "#667085",
                            letterSpacing: "0.5px",
                            mb: 1,
                            textTransform: "uppercase",
                        }}
                    >
                        Leave Details
                    </Typography>

                    <Box
                        sx={{
                            bgcolor: "#F0FDF9",
                            border: "1px solid #D1FADF",
                            borderRadius: "12px",
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: "#E6F4ED",
                                p: 1.2,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CalendarTodayOutlinedIcon sx={{ color: "#0F766E", fontSize: '1.5vw' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "1vw", color: "#101828" }}>
                                {leaveData.fromDate} – {leaveData.toDate}
                            </Typography>
                            <Typography sx={{ fontSize: "1vw", color: "#667085" }}>
                                {leaveData.daysCount} days · {leaveData.leaveType}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Note Section */}
                    <Typography
                        sx={{
                            fontSize: ".8vw",
                            fontWeight: 700,
                            color: "#667085",
                            letterSpacing: "0.5px",
                            mb: 1,
                            textTransform: "uppercase",
                        }}
                    >
                        Note by {leaveData.name}
                    </Typography>
                    <Typography sx={{ fontSize: ".8vw", color: "#344054", mb: 2 }}>
                        {leaveData.reason}
                    </Typography>

                    {/* Add Comments Action */}
                    {!showCommentInput ? (
                        <Button
                            //   startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setShowCommentInput(true)}
                            sx={{
                                color: "#F04438",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "1vw",
                                p: 0,
                                mb: 0,
                                "&:hover": { bgcolor: "transparent", color: "#D92D20" },
                            }}
                        >
                            + Add Comments
                        </Button>
                    ) : (
                        <Box sx={{ mb: 0 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={1}
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                sx={{
                                    mb: 1,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                        fontSize: "1vw",
                                    },
                                }}
                            />
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                <Button
                                    size="small"
                                    onClick={() => setShowCommentInput(false)}
                                    sx={{ textTransform: "none", color: "#667085" }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleAddComment}
                                    sx={{
                                        textTransform: "none",
                                        bgcolor: "#e9233d",
                                        "&:hover": { bgcolor: "#e9233d" },
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ mb: 1.5, borderColor: "#F2F4F7" }} />

                    {/* Activity Timeline */}
                    <Typography
                        sx={{
                            fontSize: ".9vw",
                            fontWeight: 700,
                            color: "#667085",
                            letterSpacing: "0.5px",
                            mb: 1,
                            textTransform: "uppercase",
                        }}
                    >
                        Activity
                    </Typography>

                    <Box sx={{ position: "relative", pl: 3 }}>
                        {/* Timeline Line */}
                        <Box
                            sx={{
                                position: "absolute",
                                left: 6,
                                top: 8,
                                bottom: 24,
                                width: 2,
                                bgcolor: "#EAECF0",
                            }}
                        />

                        {/* Step 1: Waiting */}
                        <Box sx={{ position: "relative", mb: 1.5 }}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: -24,
                                    top: 3,
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: "#FFF",
                                    border: "2px solid #D0D5DD",
                                }}
                            />
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#98A2B3" }}>
                                Waiting for approval
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#98A2B3" }}>–</Typography>
                        </Box>

                        {/* Step 2: Request Raised */}
                        <Box sx={{ position: "relative" }}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: -21,
                                    top: 4,
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: "#e9233d",
                                }}
                            />
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#101828" }}>
                                Request raised by {leaveData.name}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#667085" }}>
                                {leaveData.appliedDate}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Footer Actions */}
                <Box
                    sx={{
                        p: 2.5,
                        borderTop: "1px solid #F2F4F7",
                        display: "flex",
                        gap: 1.5,
                        bgcolor: "#FFFFFF",
                    }}
                >
                    {canRejectLeave && (<Button
                        fullWidth
                        variant="outlined"
                        onClick={handleReject}
                        sx={{
                            height: 44,
                            borderRadius: "10px",
                            borderColor: "#D0D5DD",
                            color: "#344054",
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "14px",
                            "&:hover": {
                                borderColor: "#98A2B3",
                                bgcolor: "#F9FAFB",
                            },
                        }}
                    >
                        Reject
                    </Button>)}
                    {canApproveLeave && (<Button
                        fullWidth
                        onClick={handleApprove}
                        variant="contained"
                        disableElevation
                        sx={{
                            height: 44,
                            borderRadius: "10px",
                            bgcolor: "#e9233d",
                            color: "#FFFFFF",
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "14px",
                            "&:hover": {
                                bgcolor: "#D92D20",
                            },
                        }}
                    >
                        Approve
                    </Button>)}
                </Box>
            </Box>
        </Drawer>
    );
}
