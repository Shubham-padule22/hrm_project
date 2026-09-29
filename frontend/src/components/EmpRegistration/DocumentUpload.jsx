import React, { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Paper,
    Chip,
    Button,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";

import {
    UploadFileOutlined,
    DescriptionOutlined,
    VisibilityOutlined,
    CloseOutlined,
} from "@mui/icons-material";

import axios from "axios";
import { API_BASE_URL } from "../../Config/api";


const statusStyles = {
    verified: {
        border: "#A6EED5",
        background: "#F5FFFC",
        iconBg: "#D8F8EB",
        iconColor: "#00A875",
        statusBg: "#DDF8ED",
        statusColor: "#009B69",
    },

    pending: {
        border: "#FFE18A",
        background: "#FFFDF7",
        iconBg: "#F1F4F7",
        iconColor: "#8EA1B8",
        statusBg: "#FFF1C4",
        statusColor: "#D98500",
    },

    notUploaded: {
        border: "#E4E8EE",
        background: "#F7F8FA",
        iconBg: "#EDF1F5",
        iconColor: "#91A1B5",
        statusBg: "#FFF1C4",
        statusColor: "#D98500",
    },

    rejected: {
        border: "#FFBFC3",
        background: "#FFF8F8",
        iconBg: "#FFE0E2",
        iconColor: "#FF3B3B",
        statusBg: "#FFE0E2",
        statusColor: "#D91C1C",
    },
};


/* =========================================================
   DOCUMENT CARD
========================================================= */

const DocumentCard = ({ document, onUpload, errors }) => {
    const documentError = errors?.documents?.[document.id];
    const styles =
        statusStyles[document.type] ||
        statusStyles.pending;

    const [selectedFiles, setSelectedFiles] = useState([]);

    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");


    /* =====================================================
       SHOW EXISTING DOCUMENT
    ===================================================== */

    useEffect(() => {

        if (document.existingDocument) {

            setSelectedFiles([
                {
                    name:
                        document.existingDocument.document
                            ?.split("/")
                            .pop() ||
                        document.title,

                    url:
                        document.existingDocument.document_url ||
                        document.existingDocument.document,

                    type: "",
                    isExisting: true,
                },
            ]);

        }

    }, [document.existingDocument, document.title]);


    /* =====================================================
       FILE CHANGE
    ===================================================== */

    const handleFileChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        setSelectedFiles([file]);

        onUpload(file, document);

        e.target.value = "";
    };


    /* =====================================================
       PREVIEW
    ===================================================== */

    const handlePreview = (file) => {

        if (!file) return;


        /* Existing API document */

        if (file.isExisting) {

            setPreviewFile(file);
            setPreviewUrl(file.url);

            return;
        }


        /* Newly selected local file */

        const url = URL.createObjectURL(file);

        setPreviewFile(file);
        setPreviewUrl(url);
    };


    /* =====================================================
       CLOSE PREVIEW
    ===================================================== */

    const handleClosePreview = () => {

        if (
            previewUrl &&
            previewFile &&
            !previewFile.isExisting
        ) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewFile(null);
        setPreviewUrl("");
    };


    /* =====================================================
       CLEANUP
    ===================================================== */

    useEffect(() => {

        return () => {

            if (
                previewUrl &&
                previewFile &&
                !previewFile.isExisting
            ) {
                URL.revokeObjectURL(previewUrl);
            }

        };

    }, [previewUrl, previewFile]);


    const hasDocument =
        selectedFiles.length > 0;


    return (
        <>
            {/* =================================================
                DOCUMENT CARD
            ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    minHeight: "12vh",
                    width: "100%",
                    border: `1px solid ${styles.border}`,
                    backgroundColor: styles.background,
                    borderRadius: "10px",
                    px: 1.2,
                    py: 0.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                }}
            >

                {/* LEFT */}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        minWidth: 0,
                        flex: 1,
                    }}
                >

                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            borderRadius: "50%",
                            backgroundColor: styles.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >

                        <DescriptionOutlined
                            sx={{
                                fontSize: 16,
                                color: styles.iconColor,
                            }}
                        />

                    </Box>


                    <Box
                        sx={{
                            minWidth: 0,
                            overflow: "hidden",
                        }}
                    >

                        <Typography
                            noWrap
                            sx={{
                                fontSize: ".69rem",
                                fontWeight: 700,
                                color: "#26354A",
                            }}
                        >
                            {document.title}
                        </Typography>


                        {hasDocument ? (

                            <Typography
                                noWrap
                                sx={{
                                    fontSize: ".5rem",
                                    color: "#2879F0",
                                    fontWeight: 500,
                                    mt: 0.3,
                                    maxWidth: "250px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                📎 {selectedFiles[0].name}
                            </Typography>

                        ) : (

                            <Typography
                                sx={{
                                    fontSize: ".5rem",
                                    color: "#D98200",
                                    mt: 0.2,
                                }}
                            >
                                Not uploaded yet
                            </Typography>

                        )}

                    </Box>

                </Stack>


                {/* RIGHT */}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.6}
                    sx={{
                        flexShrink: 0,
                        ml: 0.5,
                    }}
                >

                    {/* UPLOAD */}

                    {document.status_type && (
                        <>

                            <input
                                id={`upload-${document.id}`}
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />

                            <label
                                htmlFor={`upload-${document.id}`}
                            >

                                <Button
                                    component="span"
                                    size="small"
                                    variant="outlined"
                                    startIcon={
                                        <UploadFileOutlined
                                            sx={{
                                                fontSize:
                                                    ".7rem !important",
                                            }}
                                        />
                                    }
                                    sx={{
                                        height: 20,
                                        minWidth: 48,
                                        px: 0.7,
                                        borderRadius: "6px",
                                        borderColor: "#D9DEE6",
                                        backgroundColor: "#FFFFFF",
                                        color: "#26354A",
                                        textTransform: "none",
                                        fontSize: ".5rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {hasDocument
                                        ? "Replace"
                                        : "Upload"}
                                </Button>

                            </label>

                        </>
                    )}


                    {/* STATUS */}

                    <Chip
                        label={
                            hasDocument
                                ? "Uploaded"
                                : document.status
                        }
                        size="small"
                        sx={{
                            height: 18,
                            borderRadius: "9px",

                            backgroundColor:
                                hasDocument
                                    ? "#DDF8ED"
                                    : styles.statusBg,

                            color:
                                hasDocument
                                    ? "#009B69"
                                    : styles.statusColor,

                            fontSize: ".5rem",
                            fontWeight: 700,
                        }}
                    />


                    {/* VIEW */}

                    {hasDocument && (

                        <IconButton
                            size="small"
                            onClick={() =>
                                handlePreview(
                                    selectedFiles[0]
                                )
                            }
                            sx={{
                                p: 0.15,
                                color: "#2879F0",
                            }}
                        >

                            <VisibilityOutlined
                                sx={{
                                    fontSize: 13,
                                }}
                            />

                        </IconButton>

                    )}

                </Stack>

            </Paper>

            {/* =================================================
                PREVIEW MODAL
            ================================================= */}

            <Dialog
                open={Boolean(previewFile)}
                onClose={handleClosePreview}
                maxWidth="md"
                fullWidth
            >

                <DialogTitle
                    sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 1,
                    }}
                >

                    <Typography
                        noWrap
                        sx={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            maxWidth: "90%",
                        }}
                    >
                        {previewFile?.name}
                    </Typography>


                    <IconButton
                        size="small"
                        onClick={handleClosePreview}
                    >

                        <CloseOutlined
                            fontSize="small"
                        />

                    </IconButton>

                </DialogTitle>


                <DialogContent
                    sx={{
                        p: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "60vh",
                        backgroundColor: "#F5F7FA",
                    }}
                >

                    {/* IMAGE */}

                    {(previewFile?.type?.startsWith("image/") ||
                        previewFile?.name?.match(
                            /\.(jpg|jpeg|png|gif|webp)$/i
                        )) && (

                            <Box
                                component="img"
                                src={previewUrl}
                                alt={previewFile?.name}
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: "70vh",
                                    objectFit: "contain",
                                    borderRadius: "6px",
                                }}
                            />

                        )}


                    {/* PDF */}

                    {(previewFile?.type ===
                        "application/pdf" ||
                        previewFile?.name?.match(
                            /\.pdf$/i
                        )) && (

                            <Box
                                component="iframe"
                                src={previewUrl}
                                title={previewFile?.name}
                                sx={{
                                    width: "100%",
                                    height: "70vh",
                                    border: "none",
                                    backgroundColor:
                                        "#FFFFFF",
                                }}
                            />

                        )}

                </DialogContent>

            </Dialog>
        </>
    );
};


/* =========================================================
   DOCUMENTS
========================================================= */

export default function Documents({
    employeeId,
    handleUpload,
    errors
}) {

    const [documents, setDocuments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* =====================================================
       GET DOCUMENTS
    ===================================================== */

    useEffect(() => {

        const getDocuments = async () => {

            try {

                setLoading(true);
                setError("");


                /* =============================================
                   1. GET DOCUMENT MASTER LIST
                ============================================= */

                const documentResponse =
                    await axios.get(
                        `${API_BASE_URL}/hrm_web/document_list/`
                    );


                const documentList =
                    documentResponse.data || [];


                /* =============================================
                   2. GET EMPLOYEE UPLOADED DOCUMENTS
                ============================================= */

                const employeeResponse =
                    await axios.get(
                        `${API_BASE_URL}/hrm_web/employee_document/${employeeId}/`
                    );


                const employeeDocuments =
                    employeeResponse.data?.data || [];


                console.log(
                    "Employee Documents:",
                    employeeDocuments
                );


                /* =============================================
                   3. LATEST DOCUMENT PER DOCUMENT TYPE
                ============================================= */

                const latestDocuments = {};


                employeeDocuments.forEach(
                    (item) => {

                        const existing =
                            latestDocuments[
                            item.document_type
                            ];

                        if (
                            !existing ||
                            new Date(item.added_date) >
                            new Date(
                                existing.added_date
                            )
                        ) {

                            latestDocuments[
                                item.document_type
                            ] = item;

                        }

                    }
                );


                /* =============================================
                   4. MAP MASTER DOCUMENTS
                ============================================= */

                const mappedDocuments =
                    documentList.map(
                        (item) => {

                            const existingDocument =
                                latestDocuments[
                                item.doc_id
                                ] || null;


                            return {

                                id: item.doc_id,

                                title:
                                    item.document_type,

                                status:
                                    existingDocument
                                        ? "Uploaded"
                                        : "Pending",

                                type:
                                    existingDocument
                                        ? "verified"
                                        : "notUploaded",

                                status_type:
                                    "notUploaded",

                                source:
                                    existingDocument
                                        ? "Employee Upload"
                                        : "HR Upload",

                                date:
                                    existingDocument
                                        ?.added_date ||
                                    "",

                                existingDocument,

                            };

                        }
                    );


                console.log(
                    "Mapped Documents:",
                    mappedDocuments
                );


                setDocuments(
                    mappedDocuments
                );

            } catch (err) {

                console.error(
                    "Document API Error:",
                    err
                );

                setError(
                    "Failed to load documents."
                );

            } finally {

                setLoading(false);

            }

        };


        if (employeeId) {
            getDocuments();
        }

    }, [employeeId]);


    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: "900px",
                mx: "auto",
                px: 1,
                py: 1,
                fontFamily:
                    "Inter, Arial, sans-serif",
            }}
        >

            {/* HEADER */}

            <Box
                sx={{
                    mb: 1.2,
                    textAlign: "left",
                }}
            >

                <Typography
                    sx={{
                        fontSize: ".8rem",
                        fontWeight: 700,
                        color: "#1F2937",
                    }}
                >
                    Documents — Anthony Reeves
                </Typography>


                <Typography
                    sx={{
                        fontSize: ".6rem",
                        color: "#657B99",
                        mt: 0.2,
                    }}
                >
                    Upload, verify, or request
                    missing documents
                </Typography>

            </Box>


            {/* LOADING */}

            {loading && (

                <Typography
                    sx={{
                        fontSize: ".7rem",
                        color: "#657B99",
                        textAlign: "center",
                        py: 3,
                    }}
                >
                    Loading documents...
                </Typography>

            )}


            {/* ERROR */}

            {!loading && error && (

                <Typography
                    sx={{
                        fontSize: ".7rem",
                        color: "#D91C1C",
                        textAlign: "center",
                        py: 3,
                    }}
                >
                    {error}
                </Typography>

            )}


            {/* DOCUMENT LIST */}

            {!loading && !error && (

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                        },

                        gap: 1,
                    }}
                >

                    {documents.map(
                        (document) => (

                            <DocumentCard
                                key={document.id}
                                document={document}
                                onUpload={
                                    handleUpload
                                }
                                errors={errors}
                            />

                        )
                    )}
                    {(errors?.documents) && (
                        <Typography
                            sx={{
                                color: "#D91C1C",
                                fontSize: ".55rem",
                                mt: 0.5,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {errors?.documents}
                        </Typography>
                    )}
                </Box>

            )}

        </Box>
    );
}