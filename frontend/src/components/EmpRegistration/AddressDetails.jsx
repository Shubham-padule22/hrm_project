import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    Chip,
    Container,
    Autocomplete
} from '@mui/material';
import axiosInstance from '../../Config/axiosInstance';

const AddressDetails = ({ inputStyle, formData, handleChange, errors }) => {
    const [cityList, setCityList] = useState([]);
    const [countyList, setCountyList] = useState([]);
    const [stateList, setStateList] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axiosInstance.get(
                    "/hrm_web/getcity/"
                );

                if (response.data?.status) {
                    setCityList(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };

        fetchCities();
    }, []);

    useEffect(() => {
        const fetchCounties = async () => {
            try {
                const response = await axiosInstance.get(
                    "/hrm_web/getdistrict/"
                );

                if (response.data?.status) {
                    setCountyList(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching counties:", error);
            }
        };

        fetchCounties();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await axiosInstance.get(
                    "/hrm_web/getstate/"
                );

                if (response.data?.status) {
                    setStateList(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };

        fetchStates();
    }, []);
    return (
        <Grid container spacing={2}>
            {/* Main Personal Info */}
            <Grid item xs={12} sm={12} size={6}>
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
                    Street Address <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="clg_address"
                    value={formData.clg_address}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='123 Main Street, Apt 4B'
                    error={!!errors.clg_address}
                    helperText={errors.clg_address}
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
                    County <span style={{ color: "red" }}>*</span>
                </Typography>

                <Autocomplete
                    fullWidth
                    options={countyList}
                    getOptionLabel={(option) => option?.dst_name || ""}
                    value={
                        countyList.find(
                            (county) => String(county.dst_id) === String(formData.clg_district_id)
                        ) || null
                    }
                    onChange={(event, newValue) => {
                        handleChange({
                            target: {
                                name: "clg_district_id",
                                value: newValue?.dst_id || "",
                            },
                        });
                    }}
                    isOptionEqualToValue={(option, value) =>
                        option?.dst_id === value?.dst_id
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            name="clg_district_id"
                            sx={inputStyle}
                            placeholder="Select County"
                            error={!!errors.clg_district_id}
                            helperText={errors.clg_district_id}
                        />
                    )}
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
                    City <span style={{ color: "red" }}>*</span>
                </Typography>

                <Autocomplete
                    fullWidth
                    options={cityList}
                    loading={cityList.length === 0}
                    getOptionLabel={(option) => option?.cty_name || ""}
                    value={
                        cityList.find(
                            (city) =>
                                String(city.cty_id) === String(formData.clg_city) ||
                                city.cty_name === formData.clg_city
                        ) || null
                    }
                    onChange={(event, newValue) => {
                        handleChange({
                            target: {
                                name: "clg_city",
                                value: newValue?.cty_id || "",
                            },
                        });
                    }}
                    isOptionEqualToValue={(option, value) =>
                        option?.cty_id === value?.cty_id
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            name="clg_city"
                            sx={inputStyle}
                            placeholder="Select City"
                            error={!!errors.clg_city}
                            helperText={errors.clg_city}
                        />
                    )}
                />
            </Grid>

            {/* <Grid item xs={12} sm={6} size={6}>
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
                    State <span style={{ color: "red" }}>*</span>
                </Typography>

                <Autocomplete
                    fullWidth
                    options={stateList}
                    getOptionLabel={(option) => option?.st_name || ""}
                    value={
                        stateList.find(
                            (state) => String(state.st_id) === String(formData.clg_state_id)
                        ) || null
                    }
                    onChange={(event, newValue) => {
                        handleChange({
                            target: {
                                name: "clg_state_id",
                                value: newValue?.st_id || "",
                            },
                        });
                    }}
                    isOptionEqualToValue={(option, value) =>
                        option?.st_id === value?.st_id
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            name="clg_state_id"
                            sx={inputStyle}
                            placeholder="Select State"
                            error={!!errors.clg_state_id}
                            helperText={errors.clg_state_id}
                        />
                    )}
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
                    Country <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="clg_country"
                    value={formData.clg_country}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                        handleChange({
                            target: {
                                name: "clg_country",
                                value,
                            },
                        });
                    }}
                    sx={inputStyle}
                    placeholder="United State"
                    error={!!errors.clg_country}
                    helperText={errors.clg_country}
                />
            </Grid> */}
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
                    EIR Code <span style={{ color: "red" }}>*</span>
                </Typography>

                <TextField
                    fullWidth
                    name="postcode"
                    value={formData.postcode}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");

                        handleChange({
                            target: {
                                name: "postcode",
                                value,
                            },
                        });
                    }}
                    sx={inputStyle}
                    placeholder="60601"
                    error={!!errors.postcode}
                    helperText={errors.postcode}
                />
            </Grid>
        </Grid>
    )
}

export default AddressDetails