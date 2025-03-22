import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Card, CardMedia, CardContent, Grid, Button, Avatar, Box, CardHeader, Chip, Modal, Paper, TextField,  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase'; // ✅ Firebase storage import
import Navbar from './navbar';
import { useAuth } from '../auth/AuthContext';
import Logo from '../assets/PACE.png';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChatIcon from "@mui/icons-material/Chat"; // ✅ Correct import for Material UI icons
import { useNavigate } from 'react-router-dom';  // Import useNavigate at the top
import Chatbox from './Chatbox';




const Marketplace = () => {
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({ itemName: '', description: '', price: '', address: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openMessenger, setOpenMessenger] = useState(false);
    const [chatSeller, setChatSeller] = useState(null);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [profileUser, setProfileUser] = useState(null);
    const navigate = useNavigate();  // Initialize navigate function
    const [openChatbox, setOpenChatbox] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState("");







    useEffect(() => {
        fetchListings();
        handleUserMp();
    }, []);

    useEffect(() => {
        handleFilter();
    }, [searchQuery, selectedCategory, listings]);
    

    const fetchListings = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/marketplace/all");
            console.log("API Listings Response:", res.data); // ✅ Debugging
            setListings(res.data);
            setFilteredListings(res.data);
        } catch (error) {
            console.error("Error fetching marketplace listings:", error);
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

    const handleFilter = () => {
        let filtered = listings.filter(item => {
            const itemNameMatch = item.itemName?.toLowerCase().includes(searchQuery.toLowerCase());
            const userNameMatch = item.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return itemNameMatch || userNameMatch;
        });
    
        if (selectedCategory) {
            filtered = filtered.filter(item => 
                item.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
    
        setFilteredListings(filtered);
    };
    

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle File Upload Selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const openChat = (seller) => {
        setChatUser(seller);
        setOpenChatbox(true);
        setOpenDetailModal(false); // ✅ Close product detail modal
    };
    
    

    const openProfile = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
            setProfileUser(res.data);
            setOpenProfileModal(true);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };


    const handleUserMp = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/api/marketplace/${user?._id}`);
            // setProfileUser(res.data);
            // setOpenProfileModal(true);
            console.log("userId", res.data)
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };
    
    

    // Handle Upload & Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // ✅ Log formData before sending the request
        console.log("Form Data before submission:", formData);
        console.log("Selected File:", selectedFile);
        console.log("Selected Category:", selectedCategory);
        console.log("User ID:", user?._id);
    
        // ✅ Ensure all fields are present
        if (!user?._id || !formData.itemName || !formData.description || !formData.price || !formData.address || !selectedFile || !selectedCategory) {
            alert("Please fill all required fields before submitting.");
            return;
        }
    
        const storageRef = ref(storage, `marketplace/${user._id}/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    
        uploadTask.on(
            "state_changed",
            null,
            (error) => console.error("Upload error:", error),
            async () => {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
    
                const requestData = {
                    userId: user._id,
                    itemName: formData.itemName,
                    description: formData.description,
                    price: Number(formData.price),
                    imageUrl,
                    address: formData.address,
                    category: selectedCategory,
                    subcategory: selectedSubcategory, // ✅ Include subcategory

                };
    
                console.log("Sending Data to Backend:", requestData); // ✅ Log request data
    
                try {
                    const response = await axios.post('http://localhost:5001/api/marketplace/add', requestData);
                    console.log("Response from server:", response.data);
                    alert("Listing added successfully!");
                    setOpenModal(false);
                    fetchListings();
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
          {/* Search & Filter Row */}
          <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
                    <img src={Logo} alt="Marketplace Logo" style={{ height: "60px", marginRight: "10px" }} />
                    <Typography variant="h3" fontWeight="bold" color="#333">Marketplace</Typography>
                </Box>

                <Box display="flex" justifyContent="center" gap={2} mb={4} flexWrap="wrap">
    <TextField 
        label="Search Username or Product" 
        variant="outlined" 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        sx={{ 
            width: 900, 
            bgcolor: "white", 
            borderRadius: "25px",  // Curved edges
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
            '& .MuiOutlinedInput-root': {
                borderRadius: "25px", // Ensures input field is also curved
                '& fieldset': {
                    borderColor: "#ccc", // Subtle border color
                },
                '&:hover fieldset': {
                    borderColor: "#073574", // Border color on hover
                },
                '&.Mui-focused fieldset': {
                    borderColor: "#073574", // Border color when focused
                }
            }
        }} 
    />
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
  <Container maxWidth="md"> {/* Increased width to make the form wider */}
    <Paper 
      elevation={5} 
      sx={{ 
        p: 4, 
        borderRadius: 3, 
        bgcolor: "white", 
        boxShadow: "0px 10px 30px rgba(0,0,0,0.2)", 
        maxHeight: "90vh",  // Ensure modal doesn't go out of screen
        overflowY: "auto"   // Enable scrolling inside modal if needed
      }}
    >
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        textAlign="center" 
        gutterBottom
      >
        Sell an Item
      </Typography>

      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3
        }}
      >
        {/* Item Name */}
        <TextField 
          label="Item Name" 
          name="itemName" 
          onChange={handleChange} 
          required 
          fullWidth 
          sx={{ borderRadius: 2, bgcolor: "#f7f7f7" }}
        />

        {/* Description */}
        <TextField 
          label="Description" 
          name="description" 
          multiline 
          rows={3} 
          onChange={handleChange} 
          required 
          fullWidth 
          sx={{ borderRadius: 2, bgcolor: "#f7f7f7" }}
        />

        {/* Price & Address in a Row */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField 
            label="Price ($)" 
            name="price" 
            type="number" 
            onChange={handleChange} 
            required 
            fullWidth 
            sx={{ flex: 1, borderRadius: 2, bgcolor: "#f7f7f7" }}
          />
          
          <TextField 
            label="Address" 
            name="address" 
            onChange={handleChange} 
            required 
            fullWidth 
            sx={{ flex: 2, borderRadius: 2, bgcolor: "#f7f7f7" }}
          />
        </Box>

        {/* Category & Subcategory */}
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
          <FormControl sx={{ flex: 1, minWidth: 250 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory("");
              }}
              fullWidth
            >
              <MenuItem value="" disabled>Select a category</MenuItem>
              {Object.keys(categories).map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCategory && categories[selectedCategory] && (
            <FormControl sx={{ flex: 1, minWidth: 250 }}>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                fullWidth
              >
                <MenuItem value="" disabled>Select a subcategory</MenuItem>
                {categories[selectedCategory].map((sub) => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* File Upload Input with Image Preview */}
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: 2, 
            mt: 2 
          }}
        >
          <Button
            variant="contained"
            component="label"
            sx={{
              width: "100%",
              color: "white",
              backgroundColor: "#073574",
              borderRadius: 2,
              fontSize: "16px",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#05204d" }
            }}
          >
            Upload Image
            <input 
              type="file" 
              onChange={handleFileChange} 
              hidden 
              accept="image/*"
              required 
            />
          </Button>

          {/* Image Preview */}
          {selectedFile && (
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Preview" 
              style={{ 
                width: "100%", 
                maxHeight: "250px", 
                objectFit: "cover", 
                borderRadius: "10px", 
                boxShadow: "0px 4px 15px rgba(0,0,0,0.2)" 
              }} 
            />
          )}
        </Box>
      </Box>

      {/* Sticky Submit Button */}
      <Box 
        sx={{ 
          position: "sticky", 
          bottom: 0, 
          bgcolor: "white", 
          py: 2, 
          mt: 2, 
          textAlign: "center",
          boxShadow: "0px -2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <Button 
          variant="contained" 
          type="submit" 
          fullWidth 
          sx={{ 
            borderRadius: 2, 
            backgroundColor: "#e65a50", 
            fontSize: "18px",
            fontWeight: "bold",
            padding: "12px 20px",
            "&:hover": { backgroundColor: "#c44a3d" } 
          }}
        >
          Upload & Submit
        </Button>
      </Box>
    </Paper>
  </Container>
</Modal>

                        
          {/* Grid Layout for Listings */}
          <Grid container spacing={3} justifyContent="center">
    {filteredListings.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item._id}> {/* Changed md={3} to fit 4 per row */}
            <Card
                sx={{
                    borderRadius: '16px',
                    transition: '0.3s',
                    overflow: 'hidden',
                    backgroundColor: "#fff",
                    display: 'flex',
                    flexDirection: 'column',
                    height: "100%",
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)", 
                    '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.3)',
                    }
                }}
                onClick={(e) => {
                    if (!e.target.closest('.chat-button')) { 
                        setSelectedItem(item);
                        setOpenDetailModal(true);
                    }
                }}
            >
                {/* Enlarged Image */}
                <CardMedia 
                    component="img" 
                    image={item.imageUrl} 
                    alt={item.itemName} 
                    sx={{ 
                        height: 220, /* Adjusted to fit 4 per row layout */
                        objectFit: "cover", 
                        width: "100%", 
                        borderTopLeftRadius: "16px", 
                        borderTopRightRadius: "16px" 
                    }} 
                />

                <CardContent sx={{ padding: "16px", textAlign: 'left' }}>
                    
                    {/* Product Name */}
                    <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                        {item.itemName}
                    </Typography>

                    {/* Price & Address (Side by Side) */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip 
                            label={`$${item.price}`} 
                            sx={{ 
                                fontSize: "16px", 
                                fontWeight: "bold", 
                                backgroundColor: "#073574", 
                                color: "#fff", 
                                padding: "5px 10px", 
                                borderRadius: "8px"
                            }} 
                        />
                        <Typography variant="body2" color="gray">
                            📍 {item.address}
                        </Typography>
                    </Box>

                    {/* Description */}
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2, 
                            overflow: 'hidden'
                        }}
                    >
                        {item.description}
                    </Typography>

                    {/* User Info */}
                    <Box display="flex" alignItems="center" mt={2}>
                        <Avatar 
                            src={item.userId?.profileImage || "/default-avatar.png"} 
                            sx={{ width: 40, height: 40, border: "2px solid #ff6f61", cursor: "pointer", mr: 1 }}
                            onClick={() => navigate(`/profile/${item.userId?._id}`)}
                        />
                        <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color="primary" 
                            sx={{ cursor: "pointer", fontSize: "18px" }} /* Adjusted font size */
                            onClick={() => navigate(`/profile/${item.userId?._id}`)}
                        >
                            {item.userId?.name}
                        </Typography>
                    </Box>

                    {/* Chat Button */}
                    <Button
                        variant="contained"
                        startIcon={<ChatIcon />} 
                        sx={{ 
                            mt: 2, 
                            width: "100%",
                            borderRadius: "8px", 
                            backgroundColor: "#073574", 
                            color: "white", 
                            "&:hover": { backgroundColor: "#05204d" }
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            openChat(item.userId);
                        }}
                    >
                        Chat with Seller
                    </Button>

                </CardContent>
            </Card>
        </Grid>
    ))}
</Grid>



{/* ChatBox Model */}
    <Modal open={openChatbox} onClose={() => setOpenChatbox(false)}>
    <Container maxWidth="sm">
        <Paper 
            elevation={5} 
            sx={{ 
                p: 4, 
                borderRadius: 3, 
                boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" ,
                backgroundColor: "transparent" // Removed white background

            }}
        >
            {chatUser && (
                <>
                    {/* ✅ Seller Info */}
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                            src={chatUser?.profileImage || "/default-avatar.png"} 
                            sx={{ width: 50, height: 50, border: "2px solid #ff6f61", mr: 2 }}
                        >
                            {chatUser?.profileImage ? "" : chatUser?.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                           {chatUser?.name}
                        </Typography>
                    </Box>

                    {/* ✅ Load Chatbox Component with Selected Seller */}
                    <Chatbox userId={chatUser._id} username={chatUser.name} />
                </>
            )}
        </Paper>
    </Container>
</Modal>





   {/** Open Item */}
   <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
    <Container maxWidth="md"> {/* Made it wider for a better layout */}
        <Paper 
            elevation={5} 
            sx={{ 
                p: 4, 
                borderRadius: 4, 
                backgroundColor: "#f8f2ec", // Dark blue background for a sleek look
                color: "black", // Ensures text is readable
                boxShadow: "0px 10px 30px rgba(0,0,0,0.3)", 
                maxWidth: "700px", 
                margin: "auto",
            }}
        >
            {selectedItem && (
                <>
                    {/* ✅ User Info (Avatar + Username) */}
                    <Box display="flex" alignItems="center" mb={3}>
                        <Avatar 
                            src={selectedItem.userId?.profileImage || "/default-avatar.png"} 
                            sx={{ width: 50, height: 50, border: "2px solid #ff6f61", mr: 2 }}
                        >
                            {selectedItem.userId?.profileImage ? "" : selectedItem.userId?.name?.charAt(0)}
                        </Avatar>
                        <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ fontSize: "20px" }}
                        >
                            {selectedItem.userId?.name}
                        </Typography>
                    </Box>

                    {/* ✅ Item Name - Larger Text */}
                    <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                        {selectedItem.itemName}
                    </Typography>

                    {/* ✅ Product Image - Bigger with Shadow */}
                    <Box display="flex" justifyContent="center" my={2}>
                        <CardMedia 
                            component="img" 
                            image={selectedItem.imageUrl} 
                            alt={selectedItem.itemName} 
                            sx={{ 
                                height: "350px", // Increased height
                                objectFit: "cover", 
                                width: "100%", 
                                maxWidth: "500px", 
                                borderRadius: "10px", 
                                boxShadow: "0px 5px 15px rgba(0,0,0,0.3)" // Soft shadow effect
                            }} 
                        />
                    </Box>

                    {/* ✅ Item Details - Clean and Structured */}
                    <Box 
                        sx={{ 
                            backgroundColor: "rgba(255, 255, 255, 0.15)", 
                            borderRadius: 3, 
                            padding: 2, 
                            my: 3
                        }}
                    >
                        <Typography variant="body1" fontWeight="bold" mb={1}>
                            📖 Description: {selectedItem.description}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" mb={1}>
                            📍 Address: {selectedItem.address}
                        </Typography>
                    </Box>

                    {/* ✅ Price Highlight */}
                    <Box display="flex" justifyContent="center" my={2}>
                        <Typography 
                            variant="h5" 
                            fontWeight="bold" 
                            sx={{ 
                                background: "linear-gradient(to bottom, #f7f4ef, #e6ddd1)",
                                padding: "8px 20px",
                                borderRadius: "10px",
                                color: "#073574",
                                fontWeight: "bold"
                            }}
                        >
                            💰 Price: ${selectedItem.price}
                        </Typography>
                    </Box>

                    {/* ✅ Close Button */}
                    <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ 
                            mt: 2, 
                            backgroundColor: "linear-gradient(to bottom, #f7f4ef, #e6ddd1)", 
                            color: "#073574",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#c44a3d", color: "white" }
                        }}
                        onClick={() => setOpenDetailModal(false)}
                    >
                        Close
                    </Button>
                </>
            )}
        </Paper>
    </Container>
</Modal>


<Modal open={openProfileModal} onClose={() => setOpenProfileModal(false)}>
    <Container maxWidth="sm">
        <Paper 
            elevation={5} 
            sx={{ p: 4, borderRadius: 3, bgcolor: "white", boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
        >
            {profileUser && (
                <>
                    {/* ✅ Profile Image & Name */}
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                            src={profileUser.profileImage || "/default-avatar.png"} 
                            sx={{ width: 80, height: 80, border: "3px solid #ff6f61", mr: 2 }}
                        />
                        <Typography variant="h5" fontWeight="bold">
                            {profileUser.name}
                        </Typography>
                    </Box>

                    {/* ✅ Bio & Location */}
                    <Typography variant="body1" fontWeight="bold">
                        {profileUser.bio || "No bio available"}
                    </Typography>
                    <Typography variant="body2" color="gray" fontWeight="bold">
                        Location: {profileUser.location || "Not specified"}
                    </Typography>

                    {/* ✅ Close Button */}
                    <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 2, backgroundColor: "#ff6f61", "&:hover": { backgroundColor: "#c44a3d" } }}
                        onClick={() => setOpenProfileModal(false)}
                    >
                        Close
                    </Button>
                </>
            )}
        </Paper>
    </Container>
</Modal>




        </Container>
    </>
    );
};

export default Marketplace;
