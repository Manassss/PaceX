import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Card, CardMedia, CardContent, Grid, Button, Avatar, Box, CardHeader, Chip, Modal, Paper, TextField
} from '@mui/material';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase'; // ✅ Firebase storage import
import Navbar from './navbar';
import { useAuth } from '../auth/AuthContext';

const Marketplace = () => {
    const [listings, setListings] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({ itemName: '', description: '', price: '', address: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/marketplace/all');
            setListings(res.data);
        } catch (error) {
            console.error("Error fetching marketplace listings:", error);
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle File Upload Selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Handle Upload & Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select an image!");
            return;
        }

        // ✅ Upload image to Firebase Storage
        const storageRef = ref(storage, `marketplace/${user._id}/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on(
            "state_changed",
            null,
            (error) => console.error("Upload error:", error),
            async () => {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

                // ✅ Create the request body
                const requestData = {
                    userId: user._id,
                    itemName: formData.itemName,
                    description: formData.description,
                    price: Number(formData.price),
                    imageUrl,
                    address: formData.address,
                };

                try {
                    await axios.post('http://localhost:5001/api/marketplace/add', requestData);
                    alert("Listing added successfully!");
                    setOpenModal(false);
                    fetchListings(); // ✅ Refresh the listings after upload
                } catch (err) {
                    console.error("Error submitting data:", err.response?.data || err.message);
                    alert(`Submission failed: ${err.response?.data?.message || "Server Error"}`);
                }
            }
        );
    };

    return (
        <>
        {/* Fixed Navbar */}
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                backgroundColor: "#fff",
                boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                zIndex: 1200,
                paddingY: 1,
            }}
        >
            <Navbar />
        </Box>

        {/* Main Content */}
        <Container
            maxWidth={false}
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #f7f4ef, #e6ddd1)',
                padding: 4,
                paddingTop: '110px',
            }}
        >
            {/* Marketplace Heading */}
            <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
                <Typography variant="h3" fontWeight="bold" color="#333">
                    🛍️ Marketplace
                </Typography>
            </Box>

            {/* Add Item Button */}
            <Box display="flex" justifyContent="center" mb={4}>
                <Button
                    onClick={() => setOpenModal(true)}
                    sx={{
                        backgroundColor: '#073574', 
                        color: '#fff',
                        '&:hover': { backgroundColor: '#e65a50' },
                        padding: '12px 25px',
                        fontSize: '16px',
                        borderRadius: 3,
                        boxShadow: '0px 5px 15px rgba(255, 111, 97, 0.3)',
                    }}
                >
                    + Add Item
                </Button>
            </Box>

            {/* Upload Item Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Container maxWidth="sm">
                    <Paper elevation={3} sx={{ p: 4, mt: 5, borderRadius: 3, backgroundColor: '#fff' }}>
                        <Typography variant="h5" gutterBottom>Sell an Item</Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="Item Name" name="itemName" onChange={handleChange} required />
                            <TextField label="Description" name="description" multiline rows={3} onChange={handleChange} required />
                            <TextField label="Price" name="price" type="number" onChange={handleChange} required />
                            <TextField label="Address" name="address" onChange={handleChange} required />
                            <input type="file" onChange={handleFileChange} required />
                            <Button variant="contained" type="submit">Upload & Submit</Button>
                        </Box>
                    </Paper>
                </Container>
            </Modal>

            {/* Grid Layout for Listings */}
            <Grid container spacing={4}>
                {listings.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                        <Card
                            sx={{
                                borderRadius: '15px',
                                transition: '0.3s',
                                overflow: 'hidden',
                                backgroundColor: "#fff",
                                display: 'flex',
                                flexDirection: 'column',
                                height: "100%",
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
                                }
                            }}
                        >
                            {/* User Info */}
                            <CardHeader
                                avatar={
                                    <Avatar 
                                        src={item.userId?.profileImage || "/default-avatar.png"}
                                        sx={{ width: 50, height: 50, border: "2px solid #ff6f61" }}
                                    >
                                        {item.userId?.profileImage ? "" : item.userId?.name?.charAt(0)}
                                    </Avatar>
                                }
                                title={<Typography variant="h6" fontWeight="bold" noWrap>{item.userId?.name}</Typography>}
                                subheader={<Typography variant="body2" color="text.secondary" noWrap>{item.userId?.email}</Typography>}
                                sx={{ backgroundColor: '#f5f5f5', paddingY: 1 }}
                            />

                            {/* Fixed Size Image */}
                            <CardMedia component="img" image={item.imageUrl} alt={item.itemName} sx={{ height: "200px", objectFit: "cover", width: "100%" }} />

                            <CardContent sx={{ textAlign: 'center', padding: 2 }}>
                                <Typography variant="h6" fontWeight="bold">Item Name: {item.itemName}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">Description: {item.description}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">Address: {item.address}</Typography>

                                <Chip label={`$${item.price}`} color="primary" sx={{ fontSize: "18px", fontWeight: "bold", backgroundColor: "#ff6f61", color: "#fff" }} />
                                
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    </>
    );
};

export default Marketplace;
