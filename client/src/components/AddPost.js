import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Paper, Box } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'
import { getAuth } from "firebase/auth";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


const AddPost = () => {
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();  // Get user from context
    const [postimg, setpostimg] =useState('');
    const [selectedFile, setSelectedFile] = useState(null);  // State for image upload
    const userId = id ? id : user?._id;
    const { id } = useParams();


    

    const handleImageUpload = async () => {
        if (!selectedFile) {
            alert("Please select an image first!");
            return;
        }

        const storageRef = ref(storage, `postPictures/${userId}/${selectedFile.name}`);
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
                    // const res = await axios.put(`http://localhost:5001/api/users/profile/${userId}`, {
                    //     profileImage: downloadURL
                    // });

                    // setUserDetails(res.data.user); // Update UI state with new image URL
                    setpostimg( downloadURL ); // Ensure form data is updated
                    alert("Post picture updated successfully!");

                } catch (err) {
                    console.error("Error updating profile picture:", err.response?.data?.message || err.message);
                }
            }
        );
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const postData = {
                userId: user?._id,   // Safely accessing user data
                userName: user?.name,
                content
            };

            console.log('Post Data:', postData);  // Log the data before sending

            // Send post data to backend
            await axios.post('http://localhost:5001/api/posts/add', postData);
            alert('Post created successfully!');
            navigate('/home');  // Redirect to home after posting

        } catch (err) {
            console.error('Error creating post:', err.response?.data || err.message);  // More detailed error logging
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>Create a New Post</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="What's on your mind?"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">Post</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddPost;