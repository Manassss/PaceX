import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Avatar, Button, TextField, Grid, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';

import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const [userDetails, setUserDetails] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const { user } = useAuth();  // Get logged-in user from context
    const navigate = useNavigate();

    const userId = user?._id;

    // Fetch user profile data when component mounts
    useEffect(() => {
        if (!userId) return;  // Avoid making API call if userId is undefined

        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
                setUserDetails(res.data);  // Assuming res.data contains user object
                setFormData(res.data);     // Pre-fill form data with existing profile info
            } catch (err) {
                console.error("Error fetching profile:", err.response?.data?.message || err.message);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Handle form field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle profile save (update)
    const handleSave = async () => {
        try {
            const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, formData);
            setUserDetails(res.data);  // Update local state with new user data
            setEditMode(false);
            alert('Profile updated successfully!');
            navigate('/home')
        } catch (err) {
            console.error("Error updating profile:", err.response?.data?.message || err.message);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Box display="flex" justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        component={Link}
                        to="/home"
                        startIcon={<HomeIcon />}
                        sx={{ mb: 2 }}
                    >
                        Home
                    </Button>
                </Box>
                {/* Profile Header */}
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                        src={userDetails.profileImage || "https://via.placeholder.com/150"}
                        sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <Typography variant="h5">{userDetails.name || 'Your Name'}</Typography>
                </Box>

                {/* Profile Form */}
                <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="University"
                                name="university"
                                fullWidth
                                value={formData.university || ''}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Major"
                                name="major"
                                fullWidth
                                value={formData.major || ''}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Graduation Year"
                                name="graduationYear"
                                fullWidth
                                type="number"
                                value={formData.graduationYear || ''}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Birthdate"
                                name="birthdate"
                                fullWidth
                                type="date"
                                value={formData.birthdate ? formData.birthdate.split('T')[0] : ''}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={!editMode}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Bio"
                                name="bio"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.bio || ''}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </Grid>
                    </Grid>

                    {/* Edit/Save Buttons */}
                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
                        {editMode ? (
                            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave}>
                                Save
                            </Button>
                        ) : (
                            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                                Edit Profile
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage;