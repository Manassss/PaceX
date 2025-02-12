import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Avatar, Button, TextField, Grid, Paper, Input } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { getAuth } from "firebase/auth";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';

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

    // Navigate to the UserHome page
    const handleHomeClick = () => {
        navigate('/userhome'); // Adjust the path if it's different
    };

    return (
        <Container maxWidth="xs" sx={{ 
            width: 600, 
            height: 800, 
            bgcolor: 'white', 
            borderRadius: 3, 
            position: 'relative', 
            overflow: 'hidden', 
            p: 2,
            border: '2px solid #ccc', // Added border around the entire container
        }}>
            {/* Settings Icon */}
            <Box display="flex" justifyContent="flex-end">
                <Button variant="outlined" startIcon={<SettingsIcon />} sx={{ mb: 2 }} />
            </Box>

            <Box display="flex" justifyContent="flex-start" alignItems="center" flexDirection="column">
                {/* Profile Image */}
                <Avatar
                    src={userDetails.profileImage ? userDetails.profileImage : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                    sx={{ width: 100, height: 100, mb: 2, mr: 2 }}
                />

                {/* User Details */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                        {userDetails.name || 'Your Name'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '1.1rem', mt: 1 }}>
                        {userDetails.bio || 'No bio available'}
                    </Typography>
                </Box>

                {/* User Stats (Posts, Followers, Following) */}
                <Box sx={{ display: 'flex', gap: 3, mt: 3, justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontSize: '1rem' }}>Posts: {userDetails.posts?.length || 0}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '1rem' }}>Followers: {userDetails.followers?.length || 0}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '1rem' }}>Following: {userDetails.following?.length || 0}</Typography>
                </Box>
            </Box>

            {/* Posts Grid */}
            <Box sx={{ mt: 5, pt: 3, px: 2 }}>
                {userDetails.posts && userDetails.posts.length > 0 ? (
                    <Grid container spacing={3}>
                        {userDetails.posts.map((post, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper sx={{ p: 3, backgroundColor: 'transparent', borderRadius: 2 }}>
                                    <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>{post.content}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', fontStyle: 'italic', fontSize: '1.3rem' }}>
                        No Posts Available
                    </Typography>
                )}
            </Box>

            {/* Feed and Add Post Buttons at the Bottom */}
            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                <IconButton sx={{ backgroundColor: '#ff4500', color: 'white', borderRadius: '50%', mr: 2 }}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={handleHomeClick} sx={{ backgroundColor: '#ff4500', color: 'white', borderRadius: '50%' }}>
                    <HomeIcon />
                </IconButton>
            </Box>
        </Container>
    );
};

export default ProfilePage;
