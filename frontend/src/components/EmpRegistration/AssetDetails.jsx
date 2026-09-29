import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    Chip,
    Container,
} from '@mui/material';

const AssetDetails = ({ inputStyle, formData, handleChange, errors }) => {
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
                    Asset Type 
                    {/* <span style={{ color: "red" }}>*</span> */}
                </Typography>

               <TextField
                    fullWidth
                    name="asset"
                    value={formData.asset}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='Select asset type'
                    error={!!errors.asset}
                    helperText={errors.asset}
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
                    Asset Name 
                    {/* <span style={{ color: "red" }}>*</span> */}
                </Typography>

                <TextField
                    fullWidth
                    name="asset_name"
                    value={formData.asset_name}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='Enter Asset Name'
                    error={!!errors.asset_name}
                    helperText={errors.asset_name}
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
                    Serial Number
                     {/* <span style={{ color: "red" }}>*</span> */}
                </Typography>

                <TextField
                    fullWidth
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='Enter Serial Number'
                    error={!!errors.serial_number}
                    helperText={errors.serial_number}
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
                    Condition 
                    {/* <span style={{ color: "red" }}>*</span> */}
                </Typography>

                <TextField
                    fullWidth
                    name="condition_at_allocation"
                    value={formData.condition_at_allocation}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder=''
                    error={!!errors.condition_at_allocation}
                    helperText={errors.condition_at_allocation}
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
                  Issue Date
                   {/* <span style={{ color: "red" }}>*</span> */}
                </Typography>

                <TextField
                    fullWidth
                    type='date'
                    name="allocated_date"
                    value={formData.allocated_date}
                    onChange={handleChange}
                    sx={inputStyle}
                    // placeholder='Enter Account Name'
                    error={!!errors.allocated_date}
                    helperText={errors.allocated_date}
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
                    Note 
                    {/* <span style={{ color: "red" }}>*</span> */}
                </Typography>

                <TextField
                    fullWidth
                    type='textarea'
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder='Enter Note'
                    error={!!errors.remarks}
                    helperText={errors.remarks}
                />
            </Grid>


        </Grid>
    )
}

export default AssetDetails