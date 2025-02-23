import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Avatar, Button, TextField, Grid, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { getAuth } from "firebase/auth";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { signOut } from "firebase/auth";
import LogoutIcon from '@mui/icons-material/Logout';
import GroupAddIcon from '@mui/icons-material/GroupAdd'; // Better Follow Icon
import PersonOffIcon from '@mui/icons-material/PersonOff'; // Better Unfollow Icon
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';


const ProfilePage = () => {
    const [userDetails, setUserDetails] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = getAuth();
    const userId = id ? id : user?._id;
    const [username, setUsername] = useState('');
    const [following, setFollowing] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
                setUserDetails(res.data);
                setFormData(res.data);
                // console.log(res.data?.name);
                setUsername(res.data?.name)
            } catch (err) {
                console.error("Error fetching profile:", err.message);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            // Prepare the updated data to send to the backend


            // Send the updated data to the backend
            const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, formData);

            // Check if the response has the updated user data
            if (res.data && res.data.user) {
                // Update the userDetails state with the new profile data
                setUserDetails(res.data.user);
            }

            // Disable edit mode after saving
            setEditMode(false);

            // Show a success alert
            alert('Profile updated successfully!');
        } catch (err) {
            console.error("Error updating profile:", err.message);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return alert("Please select an image first!");

        const storageRef = ref(storage, `profilePictures/${userId}/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on(
            "state_changed",
            null,
            (error) => alert("Upload failed! Check Firebase permissions."),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("downloadurl", downloadURL);
                try {
                    // const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, {
                    //     profileImage: downloadURL,
                    //     username:
                    // });
                    // setUserDetails(res.data.user);
                    setFormData({ ...formData, profileImage: downloadURL });

                } catch (err) {
                    console.error("Error updating profile picture:", err.message);
                }
            }
        );
    };

    const handleHomeClick = () => {
        navigate('/userhome');
    };


    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/home');
        } catch (err) {
            console.error("Error signing out:", err.message);
        }
    };
    const handlechat = () => {
        console.log(`rec ${userId}--${username}`);
        navigate('/chatbox', { state: { userId: userId, username: username } })

    }

    return (
        <Container maxWidth="xs" sx={{ width: 600, height: 800, bgcolor: 'white', borderRadius: 3, position: 'relative', overflow: 'hidden', p: 2, border: '2px solid #ccc' }}>

            {/* Settings and Logout Icons */}
            <Container>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {/* Logout Icon */}
                    <IconButton onClick={handleLogout} color="secondary">
                        <LogoutIcon />
                    </IconButton>

                    {/* Settings Icon */}
                    <IconButton onClick={() => setEditMode(!editMode)} color="primary">
                        <SettingsIcon />
                    </IconButton>
                </Box>

                <Box display="flex" flexDirection="column" alignItems="center">
                    {/* Profile Image */}
                    <label htmlFor="file-input">
                        <Avatar
                            src={formData.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                            sx={{ width: 100, height: 100, mb: 2, cursor: editMode ? 'pointer' : 'default' }}
                        />
                    </label>
                    {editMode && (
                        <>
                            <input
                                id="file-input"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
                                onClick={handleImageUpload}
                            >
                                Upload Image
                            </Button>
                        </>
                    )}

                    {editMode ? (
                        <TextField
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            label="Username"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                        />
                    ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {userDetails.username || ''}
                        </Typography>
                    )}
                    {editMode ? (
                        <TextField
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            label="Full Name"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    {userDetails.name || 'Your Name'}
                                </Typography>

                                <IconButton >
                                    {following ? (
                                        <PersonAddAlt1Icon sx={{ color: 'gray', fill: 'transparent', stroke: 'gray' }} /> // Unfollow icon in red
                                    ) : (
                                        <PersonAddAlt1Icon
                                            sx={{
                                                color: 'gray',
                                                fill: 'transparent',
                                                stroke: 'gray'
                                            }}
                                        />
                                    )}
                                </IconButton>
                                <Typography>{following ? 'Unfollow' : 'Follow'}</Typography>
                            </Box>

                        </>
                    )}


                    {editMode ? (
                        <TextField
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            label="Bio"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                        />
                    ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {userDetails.bio || ''}
                        </Typography>
                    )}

                    {editMode && (
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    )}
                </Box>
            </Container>


            {/* User Stats */}
            <Box sx={{ display: 'flex', gap: 3, mt: 3, justifyContent: 'center' }}>
                <Typography variant="body2">Posts: {userDetails.posts?.length || 0}</Typography>
                <Typography variant="body2">Followers: {userDetails.followers?.length || 0}</Typography>
                <Typography variant="body2">Following: {userDetails.following?.length || 0}</Typography>
            </Box>

            {/* Posts Grid */}
            <Box sx={{ mt: 5, pt: 3, px: 2 }}>
                {userDetails.posts && userDetails.posts.length > 0 ? (
                    <Grid container spacing={3}>
                        {userDetails.posts.map((post, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper sx={{ p: 3, backgroundColor: 'transparent', borderRadius: 2 }}>
                                    <Typography variant="body2">{post.content}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', fontStyle: 'italic' }}>
                        No Posts Available
                    </Typography>
                )}
            </Box>

            {/* Home & Add Post Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                <IconButton sx={{ backgroundColor: '#ff4500', color: 'white', borderRadius: '50%', mr: 2 }}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={handleHomeClick} sx={{ backgroundColor: '#ff4500', color: 'white', borderRadius: '50%' }}>
                    <HomeIcon />
                </IconButton>
                {userId != user._id && (
                    <IconButton onClick={handlechat} sx={{ backgroundColor: '#ff4500', color: 'white', borderRadius: '50%' }}>
                        M
                    </IconButton>
                )}
            </Box>
        </Container>
    );
};

export default ProfilePage;
