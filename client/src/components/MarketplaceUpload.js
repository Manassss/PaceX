import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Paper, Box, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import { storage } from '../firebase'; // ✅ Firebase storage import
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useAuth } from '../auth/AuthContext';

const mapContainerStyle = { width: '100%', height: '300px' };

const MarketplaceUpload = ({ }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        price: '',
        address: '',
        category: '',
        subcategory: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useAuth()
    // ✅ Wrap this entire component with LoadScript to load Google Maps Places API
    return (
        <MarketplaceUploadComponent
            user={user}
            formData={formData}
            setFormData={setFormData}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
        />
    );
};

// ✅ Separate component to handle form logic
const MarketplaceUploadComponent = ({ user, formData, setFormData, selectedFile, setSelectedFile }) => {
    // Google Places Autocomplete Setup
    const { ready, value, setValue, suggestions: { status, data }, clearSuggestions } = usePlacesAutocomplete({
        requestOptions: { componentRestrictions: { country: "us" } }
    });

    const handleSelectAddress = async (address) => {
        console.log("Before Update:", formData);  // Debugging
        console.log("Before Update:", address);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });

            // Validate that results exist
            if (!results || results.length === 0) {
                console.error("No location results found.");
                alert("Could not find location. Try selecting a different address.");
                return;
            }



            // ✅ Correctly update the nested `location` object inside `formData`
            setFormData(prevState => ({
                ...prevState,
                // Ensure existing fields in `location` are not lost
                address,   // ✅ Save address text


            }));



        } catch (error) {
            console.error("Error getting location details:", error.message);
            alert("Error retrieving location. Please try again.");
        }
    };

    const categories = {
        "Electronics": ["Laptops", "Phones & Accessories", "Tablets", "Headphones"],
        "Furniture": ["Chairs", "Desks", "Beds & Mattresses", "Sofas"],
        "Clothing": ["Men’s Clothing", "Women’s Clothing", "Shoes", "Accessories"],
        "Books & Stationery": ["Textbooks", "Notebooks & Supplies", "Art & Craft"],
        "Sports & Outdoors": ["Bikes", "Gym Equipment", "Camping Gear"],
        "Miscellaneous": ["Kitchen Appliances", "Musical Instruments", "Other"]
    };
    

    // Handle text input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle image selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please select an image!");
            return;
        }

        console.log("Submitting Data:", formData);  // ✅ Debugging: Log what’s being sent

        // ✅ Upload image to Firebase Storage
        const storageRef = ref(storage, `marketplace/${user._id}/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on(
            "state_changed",
            null,
            (error) => console.error("Upload error:", error),
            async () => {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

                // ✅ Make sure to properly format the request body
                const requestData = {
                    userId: user._id,
                    itemName: formData.itemName,
                    description: formData.description,
                    price: Number(formData.price),
                    imageUrl,

                    address: formData.address,
                    category: formData.category, 
                    subcategory: formData.subcategory,


                };

                console.log("Final Payload:", requestData);  // ✅ Debugging: Check before sending

                try {
                    const res = await axios.post('http://localhost:5001/api/marketplace/add', requestData);
                    alert("Listing added successfully!");
                } catch (err) {
                    console.error("Error submitting data:", err.response?.data || err.message);
                    alert(`Submission failed: ${err.response?.data?.message || "Server Error"}`);
                }
            }
        );
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 5, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom>Sell an Item</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Item Name" name="itemName" onChange={handleChange} required />
                    <TextField label="Description" name="description" multiline rows={3} onChange={handleChange} required />
                    <TextField label="Price" name="price" type="number" onChange={handleChange} required />

                    {/* Google Places Autocomplete Input */}
                    <TextField
                        label="Enter Address"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={!ready}
                        placeholder="Search for a location"
                        fullWidth
                        required
                    />
                    {/* Dropdown suggestions */}
                    {status === "OK" && (
                        <Box sx={{ backgroundColor: "#fff", boxShadow: 1, maxHeight: "150px", overflowY: "auto" }}>
                            {data.map(({ place_id, description }) => (
                                <Box key={place_id} sx={{ p: 1, cursor: "pointer" }} onClick={() => handleSelectAddress(description)}>
                                    {description}
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Show Map */}
                    <FormControl fullWidth required>
    <InputLabel>Category</InputLabel>
    <Select
        name="category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })} 
    >
        {Object.keys(categories).map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
        ))}
    </Select>
</FormControl>

{/* Subcategory Dropdown */}
{formData.category && (
    <FormControl fullWidth required>
        <InputLabel>Subcategory</InputLabel>
        <Select
            name="subcategory"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} 
        >
            {categories[formData.category].map((subcat) => (
                <MenuItem key={subcat} value={subcat}>{subcat}</MenuItem>
            ))}
        </Select>
    </FormControl>
)}



                    <input type="file" onChange={handleFileChange} required />
                    <Button variant="contained" type="submit">Upload & Submit</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default MarketplaceUpload;