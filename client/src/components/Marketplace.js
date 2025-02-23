import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardMedia, CardContent, Grid, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
const Marketplace = () => {
    const [listings, setListings] = useState([]);
    const mapContainerStyle = {
        width: '100%',
        height: '300px',
    };
    useEffect(() => {
        const fetchListings = async () => {
            const res = await axios.get('http://localhost:5001/api/marketplace/all');
            setListings(res.data);
            console.log(res.data)
        };
        fetchListings();
    }, []);

    return (

        <Container
            maxWidth="xs"
            sx={{
                width: 600,
                height: 800,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'white',
                borderRadius: 3,
                p: 1,
                border: '2px solid #000', // Added border,
                marginTop: '50px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    display: 'none',  // Hides the scrollbar
                },
                scrollbarWidth: 'none' // Hides scrollbar in Firefox

            }}
        >
            <Typography variant="h5" gutterBottom>Marketplace</Typography>
            <Button
                color="inherit"
                component={Link}
                to="/marketplaceupload"
                sx={{ mr: 2, backgroundColor: '#333', color: '#fff', borderRadius: 1 }}
            >
                Add Item
            </Button>
            <Grid container spacing={3}>
                {listings.map((item) => (
                    <Grid item xs={12} md={6} key={item._id}>
                        <Card>
                            <CardMedia component="img" height="150" image={item.imageUrl} alt={item.itemName} />
                            <CardContent>
                                <Typography variant="h6">{item.itemName}</Typography>
                                <Typography variant="body1">${item.price}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.address}</Typography>
                            </CardContent>
                        </Card>

                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Marketplace;