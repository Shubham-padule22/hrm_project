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
    Link,
    Card,
    CardContent,
    IconButton,
    LinearProgress,
    stepConnectorClasses,
    styled,
    StepConnector,
    MenuItem,
    FormControl,
    OutlinedInput,
    Select,
    FormHelperText
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion, AnimatePresence } from 'framer-motion';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import { API_BASE_URL } from '../../Config/api';
import axios from 'axios';

const PersonalDetails = ({ inputStyle, formData, handleChange, errors }) => {

    const [titleData, setTitleData] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [maritalStatusData, setMaritalStatusData] = useState([]);
    const [userGroupList, setUserGroupList] = useState([]);
    const [reportingManagerList, setReportingManagerList] = useState([]);


    useEffect(() => {
        Promise.all([
            axios.get(`${API_BASE_URL}/hrm_web/employee_master/1`),
            axios.get(`${API_BASE_URL}/hrm_web/employee_master/2`),
            axios.get(`${API_BASE_URL}/hrm_web/employee_master/3`),
            axios.get(`${API_BASE_URL}/hrm_web/GroupGet/`),
            axios.get(`${API_BASE_URL}/hrm_web/officers_list/`),
        ])
            .then(([titleResponse, genderResponse, maritalResponse, userGroup, reportingManager]) => {
                setTitleData(titleResponse.data);
                setGenderData(genderResponse.data);
                setMaritalStatusData(maritalResponse.data);
                setUserGroupList(userGroup.data.data);
                setReportingManagerList(reportingManager.data);
            })
            .catch((error) => {
                console.error("Master API Error:", error);
            });
    }, []);
    return (
        <Grid container spacing={2}>
            {/* Main Personal Info */}
            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'
                    }}
                >
                    Title <span style={{ color: "red" }}>*</span>
                </Typography>

                <FormControl
                    fullWidth
                    error={!!errors.title}
                    sx={inputStyle}
                >
                    <Select
                        name="title"
                        value={formData.title || ""}
                        onChange={handleChange}
                        displayEmpty
                        input={<OutlinedInput />}
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ color: "#9CA3AF" }}>
                                        Select Title
                                    </span>
                                );
                            }

                            const selectedItem = titleData?.find(
                                (item) =>
                                    String(item.label) === String(selected)
                            );

                            return selectedItem?.label || "";
                        }}
                    >
                        {titleData?.map((item) => (
                            <MenuItem
                                key={item.label}
                                value={item.label}
                            >
                                {item.label}
                            </MenuItem>
                        ))}
                    </Select>

                    {errors.title && (
                        <FormHelperText>
                            {errors.title}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'
                    }}
                >
                    First Name <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    placeholder='anthonym'
                    name="clg_first_name"
                    value={formData.clg_first_name}
                    // onChange={handleChange}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                        handleChange({
                            target: {
                                name: "clg_first_name",
                                value,
                            },
                        });
                    }}
                    sx={inputStyle}
                    error={!!errors.clg_first_name}
                    helperText={errors.clg_first_name}
                />
            </Grid>
            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'
                    }}
                >
                    Last Name <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    placeholder='anthonym'
                    name="clg_last_name"
                    value={formData.clg_last_name}
                    // onChange={handleChange}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                        handleChange({
                            target: {
                                name: "clg_last_name",
                                value,
                            },
                        });
                    }}
                    sx={inputStyle}
                    error={!!errors.clg_last_name}
                    helperText={errors.clg_last_name}
                />
            </Grid>
            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'
                    }}
                >
                    User Group <span style={{ color: "red" }}>*</span>
                </Typography>

                <FormControl
                    fullWidth
                    error={!!errors.clg_group}
                    sx={inputStyle}
                >
                    <Select
                        name="clg_group"
                        value={formData.clg_group ?? ""}
                        onChange={handleChange}
                        displayEmpty
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ color: "#9CA3AF" }}>
                                        Select Status
                                    </span>
                                );
                            }

                            const selectedStatus = userGroupList?.find(
                                (item) =>
                                    String(item.gcode) === String(selected)
                            );

                            return selectedStatus?.ugname || "";
                        }}
                    >
                        {userGroupList?.map((item) => (
                            <MenuItem
                                key={item.gid}
                                value={item.gcode}
                            >
                                {item.ugname}
                            </MenuItem>
                        ))}
                    </Select>

                    {errors.clg_group && (
                        <FormHelperText>
                            {errors.clg_group}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'
                    }}
                >
                    Reporting Manager <span style={{ color: "red" }}>*</span>
                </Typography>

                <FormControl
                    fullWidth
                    error={!!errors.reporting_manager}
                    sx={inputStyle}
                >
                    <Select
                        name="reporting_manager"
                        value={formData.reporting_manager ?? ""}
                        onChange={handleChange}
                        displayEmpty
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ color: "#9CA3AF" }}>
                                        Select Reporting Manager
                                    </span>
                                );
                            }

                            const selectedManager = reportingManagerList?.find(
                                (item) => String(item.clg_id) === String(selected)
                            );

                            return selectedManager?.name || "";
                        }}
                    >
                        {reportingManagerList?.map((item) => (
                            <MenuItem
                                key={item.clg_id}
                                value={item.clg_id}
                            >
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>

                    {errors.reporting_manager && (
                        <FormHelperText>
                            {errors.reporting_manager}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'
                    }}
                >
                    Marital Status <span style={{ color: "red" }}>*</span>
                </Typography>

                <FormControl
                    fullWidth
                    error={!!errors.clg_marital_status}
                    sx={inputStyle}
                >
                    <Select
                        name="clg_marital_status"
                        value={formData.clg_marital_status ?? ""}
                        onChange={handleChange}
                        displayEmpty
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ color: "#9CA3AF" }}>
                                        Select Status
                                    </span>
                                );
                            }

                            const selectedStatus = maritalStatusData?.find(
                                (item) =>
                                    String(item.value) === String(selected)
                            );

                            return selectedStatus?.label || "";
                        }}
                    >
                        {maritalStatusData?.map((item) => (
                            <MenuItem
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </MenuItem>
                        ))}
                    </Select>

                    {errors.clg_marital_status && (
                        <FormHelperText>
                            {errors.clg_marital_status}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>


            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Phone Number <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    type="tel"
                    placeholder="Enter Phone Number"
                    name="clg_mobile_no"
                    value={formData.clg_mobile_no || ""}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        if (value.length <= 10) {
                            handleChange({
                                target: {
                                    name: "clg_mobile_no",
                                    value: value,
                                },
                            });
                        }
                    }}
                    inputProps={{
                        maxLength: 10,
                        inputMode: "numeric",
                    }}
                    sx={inputStyle}
                    error={!!errors.clg_mobile_no}
                    helperText={errors.clg_mobile_no}
                />
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        textAlign: "left",
                        fontSize: ".7rem",
                        color: "#45556C",
                    }}
                >
                    Date of Birth <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    type="date"
                    name="clg_dob"
                    value={formData.clg_dob}
                    onChange={handleChange}
                    error={!!errors.clg_dob}
                    helperText={errors.clg_dob}
                    sx={{
                        ...inputStyle,

                        "& input::-webkit-calendar-picker-indicator": {
                            opacity: 1,
                            cursor: "pointer",
                            filter: "invert(0)",
                        },
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    // sx={inputStyle}
                />
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Gender <span style={{ color: "red" }}>*</span>
                </Typography>

                <FormControl
                    fullWidth
                    error={!!errors.clg_gender}
                    sx={inputStyle}
                >
                    <Select
                        name="clg_gender"
                        value={formData.clg_gender ?? ""}
                        onChange={handleChange}
                        displayEmpty
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ color: "#9CA3AF" }}>
                                        Select Gender
                                    </span>
                                );
                            }

                            const selectedGender = genderData?.find(
                                (item) =>
                                    String(item.label) === String(selected)
                            );

                            return selectedGender?.label || "";
                        }}
                    >
                        {genderData?.map((item) => (
                            <MenuItem
                                key={item.label}
                                value={item.label}
                            >
                                {item.label}
                            </MenuItem>
                        ))}
                    </Select>

                    {errors.clg_gender && (
                        <FormHelperText>
                            {errors.clg_gender}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Personal Email <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    type="email"
                    fullWidth
                    name="clg_email"
                    placeholder="Enter Personal Email"
                    value={formData.clg_email}
                    onChange={handleChange}
                    sx={inputStyle}
                    error={!!errors.clg_email}
                    helperText={errors.clg_email}
                />
            </Grid>
            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        textAlign: "left",
                        fontSize: ".7rem",
                        color: "#45556C",
                    }}
                >
                    Joining Date <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    type="date"
                    name="clg_joining_date"
                    value={formData.clg_joining_date}
                    onChange={handleChange}
                    error={!!errors.clg_joining_date}
                    helperText={errors.clg_joining_date}
                    sx={inputStyle}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} sx={{ mt: 0 }} size={12}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        // mb: .5,
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
                        <PhoneInTalkOutlinedIcon
                            sx={{
                                color: "#0a3d31",
                                fontSize: 24,
                            }}
                        />
                    </Box>

                    <Typography
                        sx={{
                            fontSize: ".8rem",
                            fontWeight: 600,
                            color: "#0F172B",
                        }}
                    >
                        Next of Kin
                    </Typography>
                </Box>
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Contact Name <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="clg_eme_contact_name"
                    placeholder="Full Name"
                    value={formData.clg_eme_contact_name || ""}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                        handleChange({
                            target: {
                                name: "clg_eme_contact_name",
                                value: value,
                            },
                        });
                    }}
                    sx={inputStyle}
                    error={!!errors.clg_eme_contact_name}
                    helperText={errors.clg_eme_contact_name}
                />
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Relationship <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="clg_eme_contact_relation"
                    value={formData.clg_eme_contact_relation}
                    // onChange={handleChange}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                        handleChange({
                            target: {
                                name: "clg_eme_contact_relation",
                                value: value,
                            },
                        });
                    }}
                    sx={inputStyle}
                    placeholder="Friend"
                    error={!!errors.clg_eme_contact_relation}
                    helperText={errors.clg_eme_contact_relation}
                />
            </Grid>

            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Phone Number <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                    fullWidth
                    type="tel"
                    placeholder="+1 555 201 4892"
                    name="clg_eme_contact_number"
                    value={formData.clg_eme_contact_number || ""}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        if (value.length <= 10) {
                            handleChange({
                                target: {
                                    name: "clg_eme_contact_number",
                                    value: value,
                                },
                            });
                        }
                    }}
                    inputProps={{
                        maxLength: 10,
                        inputMode: "numeric",
                    }}
                    sx={inputStyle}
                    error={!!errors.clg_eme_contact_number}
                    helperText={errors.clg_eme_contact_number}
                />
            </Grid>
            <Grid item xs={12} sm={6} size={6}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        mb: .5,
                        textAlign: 'left',
                        fontSize: '.7rem',
                        color: '#45556C'

                    }}
                >
                    Address <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="clg_eme_contact_address"
                    value={formData.clg_eme_contact_address}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='Area'
                    error={!!errors.clg_eme_contact_address}
                    helperText={errors.clg_eme_contact_address}
                />
            </Grid>
        </Grid>
    )
}

export default PersonalDetails