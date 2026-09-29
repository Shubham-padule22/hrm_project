import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Button,
    Paper,
    Grid,
    Avatar,
    Chip,
    Container,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Breadcrumbs,
    // Link,
    Card,
    CardContent,
    IconButton,
    LinearProgress,
    stepConnectorClasses,
    styled,
    StepConnector,
} from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion, AnimatePresence, color } from 'framer-motion';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PersonalDetails from './PersonalDetails';
import AddressDetails from './AddressDetails';
import EducationDetails from './EducationDetails';
import SalaryDetails from './SalaryDetails';
import MedicalDetails from './MedicalDetails';
import UniformDetails from './UniformDetails';
import DocumentUpload from './DocumentUpload';
import axios from 'axios';
import { API_BASE_URL } from '../../Config/api';
import RegistrationSuccessPopup from "./RegistrationSuccessPopup";
import { useSearchParams } from "react-router-dom";
import BankDetails from './BankDetails';
import AssetDetails from './AssetDetails';

const CustomConnector = styled(StepConnector)(() => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 16,
        left: "calc(-35% + 20px)",
        right: "calc(65% + 20px)", // Increase this value to make line shorter
    },

    [`& .${stepConnectorClasses.line}`]: {
        borderTopWidth: 3,
        borderRadius: 20,
        borderColor: "#E5E7EB",
    },

    [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
        borderColor: "#0A3D31",
    },

    [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
        borderColor: "#00B884",
    },
}));
// --- DATA STRUCTURE WITH EXACT CARD STYLES & EMPLOYEES ---
const theme = createTheme({
    palette: {
        primary: {
            main: '#0a3d31', // Deep dark green from UI header/accents
        },
        secondary: {
            main: '#e63946', // Red action button color
        },
        background: {
            default: '#f4f6f8',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#6c757d',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 12,
    },
});


// --- Data Constants ---
// const STEPS = [
//     { label: 'Personal Details', icon: User },
//     { label: 'Address', icon: MapPin },
//     { label: 'Professional Details', icon: Briefcase },
//     { label: 'Salary Details', icon: DollarSign },
//     { label: 'Medical Details', icon: HeartPulse },
//     { label: 'Uniform & Equipment', icon: Shirt },
//     { label: 'Document Upload', icon: FileText },
// ];

const STEPS = [
    'Personal Details',
    'Address',
    'Education',
    'Salary Details',
    'Medical Details',
    'Uniform',
    'Document Upload',
    'Bank Details',
    // 'Asset Details'
];

const ONBOARDING_QUEUE = [
    {
        id: 1,
        name: 'Anthony Brenes',
        role: 'Senior EMT Driver',
        initials: 'AB',
        status: 'In Progress',
        statusColor: '#e3f2fd',
        statusTextColor: '#1976d2',
        progress: 70,
        actionText: 'docs missing',
        actionColor: '#d32f2f',
        active: true,
    },
    {
        id: 2,
        name: 'Fatima Al-Hassan',
        role: 'Medical Technician',
        initials: 'FA',
        status: 'Review',
        statusColor: '#f1f8e9',
        statusTextColor: '#388e3c',
        progress: 90,
        actionText: 'docs missing',
        actionColor: '#d32f2f',
        active: false,
    },
    {
        id: 3,
        name: 'Chris Donnelly',
        role: 'Dispatch Coordinator',
        initials: 'CD',
        status: 'In Progress',
        statusColor: '#e3f2fd',
        statusTextColor: '#1976d2',
        progress: 30,
        actionText: 'docs missing',
        actionColor: '#d32f2f',
        active: false,
    },
];

export default function EmployeeRegistration() {
    const [errors, setErrors] = useState({});
    const [activeStep, setActiveStep] = useState(0);
    const [selectedUser, setSelectedUser] = useState(1);
    const [employeeId, setEmployeeId] = useState(null);
    const [stepSaved, setStepSaved] = useState({
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        // 8: false
    });
    const [changedFields, setChangedFields] = useState({
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
        7: {},
    });
    //personal details

    const [searchParams] = useSearchParams();

    const empId = searchParams.get("empId");
    const isViewMode = searchParams.get("mode") === "view";

    console.log("Edit Employee ID:", empId);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [formData1, setFormData1] = useState({
        title: '',
        clg_first_name: '',
        clg_joining_date:'',
        reporting_manager:'',
        clg_last_name: '',
        clg_marital_status: '',
        clg_mobile_no: null,
        clg_dob: '',
        clg_gender: '',
        clg_email: '',
        clg_eme_contact_name: '',
        clg_eme_contact_relation: '',
        clg_eme_contact_number: null,
        clg_eme_contact_address: '',
        organization: localStorage.getItem("organization_id") || ''
    });
    //address
    const [formData2, setFormData2] = useState({
        clg_address: "",
        clg_city: "",
        clg_district_id: "",
        clg_state_id: "",
        postcode: "",
        clg_country: "",
    });

    //education
    const [formData3, setFormData3] = useState({
        clg_qualification: "",
        clg_university: "",
        clg_graduation_year: "",
        clg_certification: "",
        clg_current_employer: "",
        clg_total_experience: "",
        clg_license_number: "",
        clg_specialization: "",
    });

    //salary
    const [formData4, setFormData4] = useState({
        clg_employment_type: "",
        clg_pay_type: "",
        clg_insurance_number: "",
        clg_shift_type: "",
    });

    //Medical details
    const [formData5, setFormData5] = useState({
        clg_blood_type: "",
        clg_medical_condition: "",
        clg_allergies: "",
        clg_med_specialization: "",
        clg_medical_insurance_provider: ""
    });

    // uniform & equipmeny
    const [formData6, setFormData6] = useState({
        clg_shirt_size: "",
        clg_coat_size: "",
        clg_jacket_size: "",
        clg_hat: "",
        shirt_qty: "",
        coat_qty: "",
        coats: "",
        epaulettes: "",
        balmoral_size: "",
        balmoral_qty: "",
        contract: "",
        deposit: "",
        uniform_return: "",
        notes: ""
    });

    //bank details
    const [formData7, setFormData7] = useState({
        bank_name: "",
        bank_address: "",
        account_number: "",
        account_name: "",
        routing_number: "",
        // account_type: "",
    });

    //asset details
    const [formData8, setFormData8] = useState({
        asset: "",
        asset_name: "",
        serial_number: "",
        allocated_date: "",
        condition_at_allocation: "",
        remarks: "",
        verification_status: "pending",
        allocation_status: "active",
        expected_return_date: "2026-09-03",
        added_by: localStorage.getItem("clg_ref_id") || '',
    });

    const handlePersonalChange = (e) => {
        const { name, value } = e.target;

        setFormData1((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            0: {
                ...prev[0],
                [name]: value,
            },
        }));
        if (name === "clg_dob") {
            const error = validateDOB(value);

            setErrors((prev) => ({
                ...prev,
                clg_dob: error,
            }));
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;

        setFormData2((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            1: {
                ...prev[1],
                [name]: value,
            },
        }));
    };

    const handleEducationChange = (e) => {
        const { name, value } = e.target;

        setFormData3((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            2: {
                ...prev[2],
                [name]: value,
            },
        }));
    };

    const handleSalaryInfoChange = (e) => {
        const { name, value } = e.target;

        setFormData4((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            3: {
                ...prev[3],
                [name]: value,
            },
        }));
    };

    const handleMedicalInfoChange = (e) => {
        const { name, value } = e.target;

        setFormData5((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            4: {
                ...prev[4],
                [name]: value,
            },
        }));
    };
    const handleUniformInfoChange = (e) => {
        const { name, value } = e.target;

        setFormData6((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            5: {
                ...prev[5],
                [name]: value,
            },
        }));
    };
    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;

        setFormData7((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            7: {
                ...prev[7],
                [name]: value,
            },
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleAssetDetailsChange = (e) => {
        const { name, value } = e.target;

        setFormData8((prev) => ({
            ...prev,
            [name]: value,
        }));

        setChangedFields((prev) => ({
            ...prev,
            8: {
                ...prev[8],
                [name]: value,
            },
        }));
    };
    const handleApiErrors = (error) => {
        const apiErrors = error.response?.data;

        if (!apiErrors) {
            return;
        }

        const formattedErrors = {};

        Object.keys(apiErrors).forEach((field) => {
            let message = Array.isArray(apiErrors[field])
                ? apiErrors[field][0]
                : apiErrors[field];

            // Convert API messages to user-friendly messages
            if (field === "clg_mobile_no") {
                message = "This mobile number already exists.";
            }

            if (field === "clg_email") {
                message = "This email address already exists.";
            }

            formattedErrors[field] = message;
        });

        setErrors(formattedErrors);
    };

    const saveStep = async (step) => {
        try {
            let response;
            console.log(step, 'ssss');

            // ============================================
            // STEP 0 + NO EMPLOYEE ID = POST
            // ============================================
            if (step === 6 && employeeId) {
                console.log("Step 6: Uploading documents...");

                const uploadResponse = await handleBulkUpload();

                console.log("Bulk Upload Response:", uploadResponse);

                return uploadResponse;
            }
            if (step === 0 && !employeeId) {

                const payload = getStepPayload(step);

                console.log("POST Payload:", payload);

                response = await axios.post(
                    `${API_BASE_URL}/hrm_web/employee_registretion/`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("POST Response:", response.data);

                const id =
                    response.data?.clg_id ||
                    response.data?.employee_id ||
                    response.data?.id;

                if (!id) {
                    throw new Error("Employee ID not received from POST API");
                }

                // Save employee ID
                setEmployeeId(id);

                // Step 0 is now saved
                setChangedFields(prev => ({
                    ...prev,
                    0: {},
                }));

                return response.data;
            }
            if (step === 7 && employeeId) {
                const payload = {
                    flag: 1,
                    bank_account_data: formData7,
                };

                console.log("Bank Details Payload:", payload);

                response = await axios.put(
                    `${API_BASE_URL}/hrm_web/employee_registretion/${employeeId}/`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("Bank Details Response:", response.data);

                setChangedFields((prev) => ({
                    ...prev,
                    7: {},
                }));

                return response.data;
            }
            if (step === 8 && employeeId) {
                const payload = {
                    flag: 2,
                    asset_allocation_data: formData8,
                };

                console.log("asset Details Payload:", payload);

                response = await axios.put(
                    `${API_BASE_URL}/hrm_web/employee_registretion/${employeeId}/`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("Asset Details Response:", response.data);

                setChangedFields((prev) => ({
                    ...prev,
                    8: {},
                }));

                return response.data;
            }
            // ============================================
            // STEP 1+ OR STEP 0 AFTER BACK = PUT
            // ============================================
            if (employeeId && step != 8) {

                const payload = getStepPayload(step);

                console.log("========== SAVE STEP ==========");
                console.log("Step:", step);
                console.log("Employee ID:", employeeId);
                console.log("Payload:", payload);

                const changedPayload = changedFields[step] || {};

                console.log("Current Step:", step);
                console.log("Changed Payload:", changedPayload);

                response = await axios.put(
                    `${API_BASE_URL}/hrm_web/employee_registretion/${employeeId}/`,
                    changedPayload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("PUT Response:", response.data);

                // Clear changed fields after successful PUT
                setChangedFields(prev => ({
                    ...prev,
                    [step]: {},
                }));

                return response.data;
            }
            // STEP 7 - Bank Details
            // if (step === 7 && employeeId) {
            //     const payload = {
            //         flag: 1,
            //         bank_account_data: formData7,
            //     };

            //     console.log("Bank Details Payload:", payload);

            //     response = await axios.put(
            //         `${API_BASE_URL}/hrm_web/employee_registretion/${employeeId}/`,
            //         payload,
            //         {
            //             headers: {
            //                 "Content-Type": "application/json",
            //             },
            //         }
            //     );

            //     console.log("Bank Details Response:", response.data);

            //     setChangedFields((prev) => ({
            //         ...prev,
            //         7: {},
            //     }));

            //     return response.data;
            // }

            throw new Error("Employee ID not available");

        } catch (error) {

            console.error(
                "Save Step Error:",
                error.response?.data || error.message
            );
            handleApiErrors(error);
            throw error;
        }
    };
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const handleBulkUpload = async () => {
        try {
            const formData = new FormData();

            console.log("Selected Documents:", selectedDocuments);

            selectedDocuments.forEach((item, index) => {
                const file = item.file;

                if (!file) return;

                formData.append(
                    `documents[${index}][document_type]`,
                    String(item.document.id)
                );

                formData.append(
                    `documents[${index}][remarks]`,
                    item.document.title
                );

                formData.append(
                    `documents[${index}][document]`,
                    file,
                    file.name
                );
            });

            // Check FormData
            console.log("========== FORM DATA ==========");

            for (const [key, value] of formData.entries()) {
                console.log(
                    key,
                    value instanceof File
                        ? value.name
                        : value
                );
            }

            const response = await axios.post(
                `${API_BASE_URL}/hrm_web/candidate_documents_bulk/${employeeId}/`,
                formData
            );

            console.log("Bulk Upload Response:", response.data);

            return response.data;

        } catch (error) {
            console.error(
                "Bulk Upload Error:",
                error.response?.data || error.message
            );

            throw error;
        }
    };
    const handleUpload = (file, document) => {
        setSelectedDocuments((prev) => {
            const filtered = prev.filter(
                (item) => item.document.id !== document.id
            );

            return [
                ...filtered,
                {
                    document,
                    file,
                },
            ];
        });
    };

    const getEmployeeData = async (id) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/hrm_web/employee_registretion/${id}/`
            );

            const data = response.data;

            console.log("Employee GET Response:", data);

            // Personal
            setFormData1({
                title: data.title || "",
                clg_first_name: data.clg_first_name || "",
                reporting_manager:data.reporting_manager || "",
                clg_joining_date:data.clg_joining_date || "",
                clg_last_name: data.clg_last_name || "",
                clg_marital_status: data.clg_marital_status || "",
                clg_mobile_no: data.clg_mobile_no || 0,
                clg_dob: data.clg_dob || "",
                clg_gender: data.clg_gender || "",
                clg_email: data.clg_email || "",
                clg_eme_contact_name: data.clg_eme_contact_name || "",
                clg_eme_contact_relation: data.clg_eme_contact_relation || "",
                clg_eme_contact_number: data.clg_eme_contact_number || 0,
                clg_eme_contact_address: data.clg_eme_contact_address || "",
                clg_group: data.clg_group || ""
            });

            // Address
            setFormData2({
                clg_address: data.clg_address || "",
                clg_city: data.clg_city || "",
                postcode: data.postcode || "",
                clg_country: data.clg_country || "",
                clg_district_id: data.clg_district_id || "",
                clg_state_id: data.clg_state_id || "",
            });

            // Education
            setFormData3({
                clg_qualification: data.clg_qualification || "",
                clg_university: data.clg_university || "",
                clg_graduation_year: data.clg_graduation_year || "",
                clg_certification: data.clg_certification || "",
                clg_current_employer: data.clg_current_employer || "",
                clg_total_experience: data.clg_total_experience || "",
                clg_license_number: data.clg_license_number || "",
                clg_specialization: data.clg_specialization || "",
            });

            // Salary
            setFormData4({
                clg_employment_type: data.clg_employment_type || "",
                clg_pay_type: data.clg_pay_type || "",
                clg_insurance_number: data.clg_insurance_number || "",
                clg_shift_type: data.clg_shift_type || "",
            });

            // Medical
            setFormData5({
                clg_blood_type: data.clg_blood_type || "",
                clg_medical_condition: data.clg_medical_condition || "",
                clg_allergies: data.clg_allergies || "",
                clg_med_specialization: data.clg_med_specialization || "",
                clg_medical_insurance_provider:
                    data.clg_medical_insurance_provider || "",
            });

            // Uniform
            setFormData6({
                clg_shirt_size: data.clg_shirt_size || "",
                clg_coat_size: data.clg_coat_size || "",
                clg_jacket_size: data.clg_jacket_size || "",
                clg_hat: data.clg_hat || "",
                shirt_qty: data.shirt_qty || "",
                coat_qty: data.coat_qty || "",
                coats: data.coats || "",
                epaulettes: data.epaulettes || "",
                balmoral_size: data.balmoral_size || "",
                balmoral_qty: data.balmoral_qty || "",
                contract: data.contract || "",
                deposit: data.deposit || "",
                uniform_return: data.uniform_return || "",
                notes: data.notes || ""
            });

            //bank details
            setFormData7({
                bank_name: data?.bank_account?.bank_name || "",
                bank_address: data?.bank_account?.bank_address || "",
                account_number: data?.bank_account?.account_number || "",
                account_name: data?.bank_account?.account_name || "",
                routing_number: data?.bank_account?.routing_number || "",
                // account_type: data.account_type || "",
            })

            //bank details
            // setFormData8({
            //     asset: data.asset_allocations[0].asset || "",
            //     asset_name: data.asset_allocations[0].asset_name || "",
            //     serial_number: data.asset_allocations[0].serial_number || "",
            //     allocated_date: data.asset_allocations[0].allocated_date || "",
            //     expected_return_date: data.asset_allocations[0].expected_return_date || "",
            //     condition_at_allocation: data.asset_allocations[0].condition_at_allocation || "",
            //     verification_status: data.asset_allocations[0].asset || "",
            //     allocation_status: data.asset_allocations[0].verification_status || "",
            //     remarks: data.asset_allocations[0].remarks || "",
            //     added_by: data.asset_allocations[0].added_by || "",
            // })

            return data;

        } catch (error) {
            console.error(
                "Employee GET Error:",
                error.response?.data || error.message
            );

            throw error;
        }
    };

    //from emp directory update emp

    useEffect(() => {
        if (!empId) return;

        setEmployeeId(empId);
        getEmployeeData(empId);
    }, [empId]);

    useEffect(() => {
        if (!empId) return;

        const loadEmployee = async () => {
            try {
                console.log("Edit Mode - Employee ID:", empId);

                // Important: edit mode mein employeeId set karo
                setEmployeeId(empId);

                // Existing employee data fetch
                await getEmployeeData(empId);

            } catch (error) {
                console.error("Failed to load employee:", error);
            }
        };

        loadEmployee();
    }, [empId]);
    const getStepPayload = (step) => {
        switch (step) {
            case 0:
                return formData1;

            case 1:
                return formData2;

            case 2:
                return formData3;

            case 3:
                return formData4;

            case 4:
                return formData5;

            case 5:
                return formData6;

            case 6:
                return null;

            case 7:
                return {
                    flag: 1,
                    bank_account_data: formData7,
                };

            // case 8:
            //     return {
            //         flag: 2,
            //         asset_allocation_data: formData7,
            //     };

            default:
                return {};
        }
    };


    const validateDOB = (dob) => {
        if (!dob) {
            return "Date of Birth is required";
        }

        const dobDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < dobDate.getDate())
        ) {
            age--;
        }

        if (age < 18) {
            return "Employee must be at least 18 years old";
        }

        return "";
    };
    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {

            // ==========================
            // STEP 0 - Personal Details
            // ==========================
            case 0:
                if (!formData1.title?.toString().trim()) {
                    newErrors.title = "Title is required";
                }

                if (!formData1.clg_first_name?.toString().trim()) {
                    newErrors.clg_first_name = "First name is required";
                }
                if (!formData1.clg_joining_date?.toString().trim()) {
                    newErrors.clg_joining_date = "Joining date is required";
                }
                if (!formData1.reporting_manager?.toString().trim()) {
                    newErrors.reporting_manager = "Reporting Manager is required";
                }
                if (!formData1.clg_last_name?.toString().trim()) {
                    newErrors.clg_last_name = "Last name is required";
                }

                if (!formData1.clg_group?.toString().trim()) {
                    newErrors.clg_group = "User Group is required";
                }

                if (!formData1.clg_marital_status?.toString().trim()) {
                    newErrors.clg_marital_status = "Marital status is required";
                }

                if (!formData1.clg_mobile_no?.toString().trim()) {
                    newErrors.clg_mobile_no = "Mobile number is required";
                } else if (
                    !/^\d{10}$/.test(formData1.clg_mobile_no.toString())
                ) {
                    newErrors.clg_mobile_no = "Enter a valid 10-digit mobile number";
                }

                if (!formData1.clg_dob?.toString().trim()) {
                    newErrors.clg_dob = "Date of birth is required";
                }

                if (!formData1.clg_gender?.toString().trim()) {
                    newErrors.clg_gender = "Gender is required";
                }

                if (!formData1.clg_email?.toString().trim()) {
                    newErrors.clg_email = "Email is required";
                } else if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        formData1.clg_email
                    )
                ) {
                    newErrors.clg_email = "Enter a valid email address";
                }

                if (!formData1.clg_eme_contact_name?.toString().trim()) {
                    newErrors.clg_eme_contact_name =
                        "Emergency contact name is required";
                }

                if (!formData1.clg_eme_contact_relation?.toString().trim()) {
                    newErrors.clg_eme_contact_relation =
                        "Emergency contact relation is required";
                }

                if (!formData1.clg_eme_contact_number?.toString().trim()) {
                    newErrors.clg_eme_contact_number =
                        "Emergency contact number is required";
                } else if (
                    !/^\d{10}$/.test(
                        formData1.clg_eme_contact_number.toString()
                    )
                ) {
                    newErrors.clg_eme_contact_number =
                        "Enter a valid 10-digit contact number";
                }

                if (!formData1.clg_eme_contact_address?.toString().trim()) {
                    newErrors.clg_eme_contact_address =
                        "Emergency contact address is required";
                }

                break;

            // ==========================
            // STEP 1 - Address
            // ==========================
            // case 1:
            //     if (!formData2.clg_address?.trim())
            //         newErrors.clg_address = "Address is required";

            //     if (!formData2.clg_city?.trim())
            //         newErrors.clg_city = "City is required";

            //     if (!formData2.postcode?.trim())
            //         newErrors.postcode = "Postcode is required";

            //     if (!formData2.clg_country?.trim())
            //         newErrors.clg_country = "Country is required";

            //     if (!formData2.clg_state_id?.trim())
            //         newErrors.clg_state_id = "State is required";

            //     if (!formData2.clg_district_id?.trim())
            //         newErrors.clg_district_id = "County is required";

            //     break;

            case 1:
                console.log("========== STEP 1 VALIDATION ==========");
                console.log("Address:", formData2.clg_address);
                console.log("City:", formData2.clg_city);
                console.log("Postcode:", formData2.postcode);
                console.log("Country:", formData2.clg_country);
                console.log("State:", formData2.clg_state_id);
                console.log("District:", formData2.clg_district_id);

                if (!formData2.clg_address?.trim()) {
                    console.log("❌ Address missing");
                    newErrors.clg_address = "Address is required";
                }

                if (!String(formData2.clg_city ?? '').trim()) {
                    console.log("❌ City missing");
                    newErrors.clg_city = "City is required";
                }

                if (!formData2.postcode?.trim()) {  
                    console.log("❌ Postcode missing");
                    newErrors.postcode = "Postcode is required";
                }

                // if (!formData2.clg_country?.trim()) {
                //     console.log("❌ Country missing");
                //     newErrors.clg_country = "Country is required";
                // }

                // if (!String(formData2.clg_state_id ?? '').trim()) {
                //     console.log("❌ State missing");
                //     newErrors.clg_state_id = "State is required";
                // }

                if (!String(formData2.clg_district_id ?? '').trim()) {
                    console.log("❌ District missing");
                    newErrors.clg_district_id = "County is required";
                }

                break;

            // ==========================
            // STEP 2 - Education
            // ==========================
            case 2:
                if (!formData3.clg_qualification?.trim())
                    newErrors.clg_qualification = "Qualification is required";

                if (!formData3.clg_university?.trim())
                    newErrors.clg_university = "University is required";

                break;

            // ==========================
            // STEP 3 - Salary
            // ==========================
            case 3:
                if (!formData4.clg_employment_type)
                    newErrors.clg_employment_type =
                        "Employment Type is required";

                // if (!formData4.clg_pay_type)
                //     newErrors.clg_pay_type =
                //         "Pay Type is required";

                break;

            // ==========================
            // STEP 4 - Medical
            // ==========================
            case 4:
                if (!formData5.clg_blood_type)
                    newErrors.clg_blood_type =
                        "Blood Group is required";

                break;

            // ==========================
            // STEP 5 - Uniform
            // ==========================
            case 5:
                if (!formData6.clg_shirt_size)
                    newErrors.clg_shirt_size =
                        "Shirt size is required";

                break;

            // ==========================
            // STEP 6 - Documents
            // ==========================
            case 6:
                if (selectedDocuments.length === 0)
                    newErrors.documents =
                        "Please upload at least one document";

                break;

            // ==========================
            // STEP 7 - Bank Details
            // ==========================
            case 7:
                if (!formData7.bank_name?.trim())
                    newErrors.bank_name = "Bank name is required";

                if (!formData7.bank_address?.trim())
                    newErrors.bank_address = "Bank address is required";

                if (!formData7.account_number?.trim())
                    newErrors.account_number = "Account number is required";

                if (!formData7.account_name?.trim())
                    newErrors.account_name = "Account name is required";

                if (!formData7.routing_number?.trim()) {
                    newErrors.routing_number = "Sort code is required";
                } else if (!/^\d{6}$/.test(formData7.routing_number)) {
                    newErrors.routing_number =
                        "Enter a valid 6 digit sort code";
                }

                break;

            default:
                break;
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // const handleNext = async () => {
    //     try {
    //         // Current step ka data save hoga
    //         // First time = POST
    //         // Back ke baad = PUT
    //         await saveStep(activeStep);

    //         // Last step nahi hai to next step par jao
    //         if (activeStep < STEPS.length - 1) {
    //             setActiveStep((prev) => prev + 1);
    //         }

    //     } catch (error) {
    //         console.error("Unable to save current step:", error);
    //     }
    // };

    // const handleNext = async () => {

    //     const isValid = validateStep(activeStep);

    //     if (!isValid) {
    //         const firstError = document.querySelector(".Mui-error");
    //         firstError?.scrollIntoView({
    //             behavior: "smooth",
    //             block: "center",
    //         });
    //         return;
    //     }

    //     try {

    //         const response = await saveStep(activeStep);

    //         console.log("Step Save Response:", response);

    //         if (activeStep === STEPS.length - 1) {
    //             setRegistrationSuccess(true);
    //             return;
    //         }

    //         setActiveStep((prev) => prev + 1);

    //     } catch (error) {

    //         console.error(
    //             "Unable to save current step:",
    //             error.response?.data || error.message
    //         );
    //     }
    // };

    const handleNext = async () => {
        console.log("🔥 HANDLE NEXT CALLED");
        console.log("Active Step:", activeStep);

        const isValid = validateStep(activeStep);

        console.log("🔥 VALIDATION RESULT:", isValid);
        console.log("🔥 ERRORS:", errors);
        console.log("🔥 FORM DATA 2:", formData2);

        if (!isValid) {
            console.log("❌ VALIDATION FAILED - saveStep will NOT execute");

            const firstError = document.querySelector(".Mui-error");

            firstError?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            return;
        }

        console.log("✅ VALIDATION PASSED");
        console.log("🔥 CALLING saveStep NOW");

        try {
            const response = await saveStep(activeStep);

            console.log("🔥 SAVE RESPONSE:", response);

            if (activeStep === STEPS.length - 1) {
                setRegistrationSuccess(true);
                return;
            }

            setActiveStep((prev) => prev + 1);
        } catch (error) {
            console.error(
                "❌ Unable to save current step:",
                error.response?.data || error.message
            );
        }
    };
    const handleBack = async () => {
        if (activeStep === 0) return;

        const previousStep = activeStep - 1;

        try {
            if (employeeId) {
                await getEmployeeData(employeeId);
            }

            setActiveStep(previousStep);

        } catch (error) {
            console.error("Back navigation error:", error);
        }
    };

    const resetRegistration = () => {
        // Step 1 par le jao
        setActiveStep(0);

        // Employee ID clear
        setEmployeeId(null);

        // Selected uploaded files clear
        setSelectedDocuments([]);

        // Form data reset
        setFormData1({
            title: '',
            clg_first_name: '',
            reporting_manager:'',
            clg_last_name: '',
            clg_marital_status: '',
            clg_mobile_no: null,
            clg_dob: '',
            clg_gender: '',
            clg_email: '',
            clg_eme_contact_name: '',
            clg_eme_contact_relation: '',
            clg_eme_contact_number: null,
            clg_eme_contact_address: '',
            clg_joining_date:''
        });

        setFormData2({
            clg_address: "",
            clg_city: "",
            clg_district_id: "",
            clg_state_id: "",
            postcode: "",
            clg_country: "",
        });

        setFormData3({
            clg_qualification: "",
            clg_university: "",
            clg_graduation_year: "",
            clg_certification: "",
            clg_current_employer: "",
            clg_total_experience: "",
            clg_license_number: "",
            clg_specialization: "",
        });

        setFormData4({
            clg_employment_type: "",
            clg_pay_type: "",
            clg_insurance_number: "",
            clg_shift_type: "",
        });

        setFormData5({
            clg_blood_type: "",
            clg_medical_condition: "",
            clg_allergies: "",
            clg_med_specialization: "",
            clg_medical_insurance_provider: "",
        });

        setFormData6({
            clg_shirt_size: "",
            clg_coat_size: "",
            clg_jacket_size: "",
            clg_hat: "",
        });

        setFormData7({
            bank_name: "",
            bank_address: "",
            account_number: "",
            account_name: "",
            routing_number: "",
        });

        // setFormData8({
        //     asset: "",
        //     allocated_date: "",
        //     expected_return_date: "",
        //     condition_at_allocation: "",
        //     verification_status: "",
        //     allocation_status: "",
        //     remarks: "",
        //     added_by: "",
        // });
        // Changed fields clear
        setChangedFields({
            0: {},
            1: {},
            2: {},
            3: {},
            4: {},
            5: {},
            7: {},
            // 8: {},
        });

        // Step saved state clear
        setStepSaved({
            0: false,
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false,
            8: false
        });

        // Validation errors clear
        setErrors({});
    };

    //change on step numbers 
    const handleStepClick = async (stepIndex) => {
        // Only allow direct step navigation in edit mode
        if (!empId) return;

        try {
            // Latest employee data load kar lo
            if (employeeId) {
                await getEmployeeData(employeeId);
            }

            setErrors({});
            setActiveStep(stepIndex);
        } catch (error) {
            console.error("Stepper navigation error:", error);
        }
    };

    // Input Field Styles
    const inputStyle = {
        "& .MuiOutlinedInput-root": {
            height: 42,
            fontSize: "0.85rem",
            backgroundColor: "#F8F9FB",
            borderRadius: "8px",

            "& fieldset": {
                border: "1px solid #D1D5DB",
            },

            "&:hover fieldset": {
                borderColor: "#BFC5CD",
            },

            "&.Mui-focused fieldset": {
                borderColor: "#0A3D31",
                borderWidth: "1px",
            },
        },

        "& .MuiInputBase-input": {
            padding: "10px 12px",
            fontSize: "0.85rem",
            textAlign: "left",
        },

        "& .MuiInputLabel-root": {
            fontSize: "0.8rem",
        },
    };

    // Render Step Forms dynamically
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <PersonalDetails inputStyle={inputStyle} formData={formData1} handleChange={handlePersonalChange} errors={errors} isViewMode={isViewMode} />
                );

            case 1:
                return (
                    <AddressDetails inputStyle={inputStyle} formData={formData2} handleChange={handleAddressChange} errors={errors} isViewMode={isViewMode} />
                );

            case 2:
                return (
                    <EducationDetails inputStyle={inputStyle} formData={formData3} handleChange={handleEducationChange} errors={errors} isViewMode={isViewMode} />
                );

            case 3:
                return (
                    <SalaryDetails inputStyle={inputStyle} formData={formData4} handleChange={handleSalaryInfoChange} errors={errors} isViewMode={isViewMode} />
                );
            case 4:
                return (
                    <MedicalDetails inputStyle={inputStyle} formData={formData5} handleChange={handleMedicalInfoChange} errors={errors} isViewMode={isViewMode} />
                );

            case 5:
                return (
                    <UniformDetails inputStyle={inputStyle} formData={formData6} handleChange={handleUniformInfoChange} errors={errors} isViewMode={isViewMode} />
                );

            case 6:
                return (
                    <DocumentUpload handleUpload={handleUpload} employeeId={employeeId} errors={errors} isViewMode={isViewMode} />
                );

            case 7:
                return (
                    <BankDetails inputStyle={inputStyle} formData={formData7} handleChange={handleBankDetailsChange} employeeId={employeeId} errors={errors} isViewMode={isViewMode} />
                );

            // case 8:
            //     return (
            //         <AssetDetails inputStyle={inputStyle} formData={formData8} handleChange={handleAssetDetailsChange} employeeId={employeeId} errors={errors} />
            //     );

            default:
                return null;
        }
    };


    const getProgressColor = (value) => {
        if (value <= 25) return "#0C3328"; // Red
        if (value <= 50) return "#0C3328"; // Orange
        if (value <= 75) return "#0C3328"; // Blue
        return "#0C3328"; // Green
    };
    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: 'auto%', pt: 0, pb: 6, ml: 0 }}>
            <Container maxWidth="100%">
                {/* Breadcrumbs Header */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#919EAB' }} />}
                        sx={{ mb: 1, ml: -1 }}
                    >
                        <Link style={{
                            fontSize: "0.875rem",
                            textDecoration: "none",
                            color: "#626A75",
                        }}>
                            Home
                        </Link>
                        <Link
                            // component={RouterLink}
                            to={'/Employee-Directory'}
                            style={{
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                color: "#626A75",
                            }}
                        >
                            Employee Directory
                        </Link>
                        <Typography color="#1D293D" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                            Employee Registration
                        </Typography>
                    </Breadcrumbs>
                </motion.div>
                <Grid container spacing={3} sx={{ ml: -1 }}>
                    {/* Left Sidebar - Onboarding Queue */}
                    {/* <Grid item xs={12} md={3} size={3}>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                fontWeight: 600,
                                color: "#0a3d31",
                                textAlign: 'left',
                                fontSize: '1rem'
                            }}
                        >
                            Onboarding Queue
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            {ONBOARDING_QUEUE.map((user) => {
                                const isSelected = selectedUser === user.id;

                                return (
                                    <motion.div
                                        key={user.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedUser(user.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: "16px",
                                                border: isSelected
                                                    ? "2px solid #0a3d31"
                                                    : "1px solid #E0E0E0",
                                                bgcolor: isSelected ? "#F4FBF7" : "#FFFFFF",
                                                transition: "all 0.25s ease",
                                            }}
                                        >
                                            <CardContent
                                                sx={{
                                                    p: 2,
                                                    "&:last-child": {
                                                        pb: 2,
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1.5,
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                bgcolor: "#0a3d31",
                                                                fontSize: "0.775rem",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {user.initials}
                                                        </Avatar>

                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                justifyContent: "center",
                                                                gap: .5, // No gap between Typography components
                                                                textAlign: 'left'
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontSize: ".7rem",
                                                                    fontWeight: 600,
                                                                    lineHeight: 1,
                                                                    m: 0,
                                                                    p: 0,
                                                                }}
                                                            >
                                                                {user.name}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontSize: ".6rem",
                                                                    color: "text.secondary",
                                                                    lineHeight: 1,
                                                                    m: 0,
                                                                    p: 0,
                                                                }}
                                                            >
                                                                {user.role}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Chip
                                                        label={user.status}
                                                        size="small"
                                                        sx={{
                                                            height: 22,
                                                            fontSize: "0.6rem",
                                                            fontWeight: 600,
                                                            bgcolor: user.statusColor,
                                                            color: user.statusTextColor,
                                                        }}
                                                    />
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={user.progress}
                                                    sx={{
                                                        flex: 1,
                                                        mr: 2,
                                                        mt: 1,
                                                        height: 6,
                                                        borderRadius: 10,
                                                        bgcolor: "#ECEFF3",

                                                        "& .MuiLinearProgress-bar": {
                                                            borderRadius: 10,
                                                            background: getProgressColor(user.progress),
                                                            transition: "all 0.4s ease",
                                                        },
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        mt: 0,
                                                        pt: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#90A1B9",
                                                            fontSize: '.6rem'
                                                        }}
                                                    >
                                                        {user.progress}% Complete
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: user.actionColor,
                                                            letterSpacing: '0',
                                                            fontSize: '.6rem'
                                                        }}
                                                    >
                                                        {user.actionText}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </Box>
                    </Grid> */}

                    <Grid item xs={12} md={9} size={11} offset={{ md: .5 }} >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: '20px',
                                backgroundColor: '#ffffff',
                                minHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                                justify: 'space-between',
                            }}
                        >
                            <Box>
                                {/* Stepper Header */}
                                <Stepper activeStep={activeStep} alternativeLabel connector={<CustomConnector />}
                                    sx={{
                                        "& .MuiStepIcon-root": {
                                            color: "#D1D5DB", // Inactive step
                                        },

                                        "& .MuiStepIcon-root.Mui-active": {
                                            color: "#0C3328", // Active step
                                        },

                                        "& .MuiStepIcon-root.Mui-completed": {
                                            color: "#00B884", // Completed step
                                        },
                                    }}>
                                    {STEPS.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel
                                                onClick={() => handleStepClick(index)}
                                                sx={{
                                                    cursor: empId ? "pointer" : "default",
                                                    "&:hover": empId
                                                        ? {
                                                            "& .MuiStepLabel-label": {
                                                                color: "#0A3D31",
                                                            },
                                                        }
                                                        : {},
                                                }}
                                                StepIconComponent={({ active, completed, icon }) => (
                                                    <Box
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: "50%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            bgcolor: active || completed ? "#0A3D31" : "#F3F4F6",
                                                            color: "#fff",
                                                            cursor: empId ? "pointer" : "default",
                                                        }}
                                                    >
                                                        {completed ? (
                                                            <CheckRoundedIcon sx={{ fontSize: 18 }} />
                                                        ) : (
                                                            icon
                                                        )}
                                                    </Box>
                                                )}
                                            >
                                                <Typography
                                                    sx={{
                                                        mt: -1.5,
                                                        fontSize: "0.7rem",
                                                        fontWeight: activeStep === index ? 700 : 500,
                                                        color:
                                                            activeStep === index
                                                                ? "#0A3D31"
                                                                : activeStep > index
                                                                    ? "#00B884"
                                                                    : "#626A75",
                                                        transition: "all 0.3s ease",
                                                    }}
                                                >
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>

                                {/* Title & Current Step indicator */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        mb: 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            bgcolor: "#F3F4F6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <PersonOutlinedIcon
                                            sx={{
                                                color: "#0a3d31",
                                                fontSize: 24,
                                            }}
                                        />
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            mt: 2
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#0F172B",
                                                lineHeight: 1.2,
                                                fontSize: '.8rem',
                                                textAlign: 'left'

                                            }}
                                        >
                                            {STEPS[activeStep]}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "text.secondary",
                                                textAlign: 'left'

                                            }}
                                        >
                                            Step {activeStep + 1} of {STEPS.length}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Animated Active Form Container */}
                                <Box
                                    component="fieldset"
                                    disabled={isViewMode}
                                    sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            {renderStepContent(activeStep)}
                                        </motion.div>
                                    </AnimatePresence>
                                </Box>
                            </Box>

                            {/* Bottom Action Button */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2,
                                    mt: 5,
                                }}
                            >
                                {activeStep > 0 && (
                                    <Button
                                        onClick={handleBack}
                                        sx={{
                                            color: "#45556C",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            px: 4,
                                            border: '1px solid #B5BBC4',
                                            borderRadius: '12px',
                                            // boxShadow: '0 6px 20px 0 rgba(220, 31, 48, 0.32)',
                                        }}
                                    >
                                        Back
                                    </Button>
                                )}

                                {!isViewMode && (
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            sx={{
                                                background: "linear-gradient(225deg, #DC1F30 14.64%, #F04050 85.36%)",
                                                "&:hover": {
                                                    background: "linear-gradient(135deg, #C81A2B 0%, #E53945 100%)",
                                                },
                                                borderRadius: "10px",
                                                px: 7,
                                                py: 1,
                                                textTransform: "none",
                                                fontSize: ".8rem",
                                                fontWeight: 600,
                                                boxShadow: '0 6px 20px 0 rgba(220, 31, 48, 0.32)',

                                            }}
                                        >
                                            {activeStep === STEPS.length - 1
                                                ? "Finish Registration"
                                                : `Next: ${STEPS[activeStep + 1]}`}
                                        </Button>
                                    </motion.div>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <RegistrationSuccessPopup
                open={registrationSuccess}
                onClose={() => {
                    setRegistrationSuccess(false);
                    resetRegistration();
                }}
            />
        </Box>
    );
}