import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Avatar, Button, TextField, Grid, Paper, Input } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import { getAuth } from "firebase/auth";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";




import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ProfilePage = () => {
    const [userDetails, setUserDetails] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);  // State for image upload
    const { user } = useAuth();  // Get logged-in user from context
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = getAuth(); // Get authentication instance
    const userId = id ? id : user?._id;

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

    // Handle image selection
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };


    const handleImageUpload = async () => {
        if (!selectedFile) {
            alert("Please select an image first!");
            return;
        }

        const storageRef = ref(storage, `profilePictures/${userId}/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                console.log(`Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
            },
            (error) => {
                console.error("Upload error:", error);
                alert("Upload failed. Check Firebase Storage permissions.");
            },
            async () => {
                // ✅ Get the download URL from Firebase Storage
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Downloaded URL:", downloadURL);

                // ✅ Update profileImage in MongoDB immediately after uploading
                try {
                    const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, {
                        profileImage: downloadURL
                    });

                    setUserDetails(res.data.user); // Update UI state with new image URL
                    setFormData({ ...formData, profileImage: downloadURL }); // Ensure form data is updated
                    alert("Profile picture updated successfully!");

                } catch (err) {
                    console.error("Error updating profile picture:", err.response?.data?.message || err.message);
                }
            }
        );
    };

    // Handle profile save (update)
    const handleSave = async () => {
        try {
            // Ensure profileImage is included in the request
            const updatedData = { ...formData, profileImage: userDetails.profileImage };

            const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, updatedData);
            setUserDetails(res.data.user);  // Update state with new user data
            setEditMode(false);
            alert('Profile updated successfully!');
            navigate('/home');
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
                        src={userDetails.profileImage ? userDetails.profileImage : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                        sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <Typography variant="h5">{userDetails.name || 'Your Name'}</Typography>
                </Box>

                {/* Image Upload */}
                {user && user._id === userId && (
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 3 }}>
                        <Input type="file" onChange={handleFileChange} />
                        <Button variant="contained" color="primary" onClick={handleImageUpload} sx={{ mt: 2 }}>
                            Upload Picture
                        </Button>
                    </Box>
                )}

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