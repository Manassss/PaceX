import React, { useEffect, useState } from 'react';
// Google Maps libraries constant to avoid re-creation on every render

import axios from 'axios';
import {
  Container, Typography, Card, CardMedia, CardContent, Grid, Button, Avatar, Box, CardHeader, Chip, Modal, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Menu, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase'; // ✅ Firebase storage import
import Navbar from './navbar';
import { useAuth } from '../auth/AuthContext';
import Logo from '../assets/PACE.png';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChatIcon from "@mui/icons-material/Chat"; // ✅ Correct import for Material UI icons
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';  // Import useNavigate at the top
import Chatbox from './Chatbox';
import { FaUpload } from 'react-icons/fa';
import { useRef } from 'react';
import Webcam from 'react-webcam';


import { host } from '../components/apinfo';


const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ itemName: '', description: '', price: '', address: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [openMessenger, setOpenMessenger] = useState(false);
  const handleTabChange = (event, newValue) => setTabIndex(newValue);
  const [chatSeller, setChatSeller] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const navigate = useNavigate();  // Initialize navigate function
  const [openChatbox, setOpenChatbox] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const addressInputRef = useRef(null);
  const GOOGLE_MAP_LIBRARIES = ['places'];
  // Attach Google Places Autocomplete to the address input

  const autocompleteRef = useRef(null);

  const handleMenuOpen = (e, item) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };








  useEffect(() => {
    fetchListings();
    handleUserMp();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchQuery, selectedCategory, listings]);

  const displayedListings = tabIndex === 1
    ? listings.filter(item => item.userId?._id === user?._id && !item.sold)
    : filteredListings.filter(item => !item.sold);


  const fetchListings = async () => {
    try {
      const res = await axios.get(`${host}/api/marketplace/all`);
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
    const file = e.target.files[0];
    console.log("handleFileChange - selected file:", file);
    setSelectedFile(file);
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        console.log("handleCapture - captured file:", file);
        setSelectedFile(file);
        setCameraOpen(false);
      });
  };

  const openChat = (seller) => {
    setChatUser(seller);
    setOpenChatbox(true);
    setOpenDetailModal(false); // ✅ Close product detail modal
  };



  const openProfile = async (userId) => {
    try {
      const res = await axios.get(`${host}/api/users/profile/${userId}`);
      setProfileUser(res.data);
      setOpenProfileModal(true);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };


  const handleUserMp = async () => {
    console.log("handleUserMp invoked for user:", user?._id);
    try {
      const res = await axios.get(`${host}/api/users/profile/${user?._id}`);
      console.log("User profile data:", res.data);
      // If you need to display or use this data, do so here
    } catch (error) {
      console.error("Error fetching user profile in handleUserMp:", error);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`${host}/api/marketplace/${id}`);
      setListings((prev) => prev.filter(item => item._id !== id));
      console.log(`Listing ${id} deleted successfully`);
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Could not delete listing.");
    }
  };

  const handleToggleSold = async (id, currentlySold) => {
    try {
      const { data } = await axios.patch(`${host}/api/marketplace/${id}/status`, {
        sold: !currentlySold
      });
      // update that one item in state
      setListings((prev) =>
        prev.map(item =>
          item._id === id ? data.item : item
        )
      );
      console.log(`Listing ${id} status updated to ${!currentlySold}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update status.");
    }
  };

  const visible = listings.filter(item => {
    if (!item.sold) return true;
    // if sold, only owner sees it
    return user && item.userId._id === user._id;
  });




  // Handle Upload & Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit invoked with:", {
      userId: user?._id,
      formData,
      selectedFile,
      selectedCategory
    });

    console.log("Form Data before submission:", formData);
    console.log("Selected File:", selectedFile);
    console.log("Selected Category:", selectedCategory);
    console.log("User ID:", user?._id);

    if (!user?._id || !formData.itemName || !formData.description || !formData.price || !formData.address || !selectedFile || !selectedCategory) {
      alert("Please fill all required fields before submitting.");
      return;
    }

    const storageRef = ref(storage, `marketplace/${user._id}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log(`Upload progress: ${progress}%`);
      },
      (error) => {
        console.error("Upload error callback:", error);
      },
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
          subcategory: selectedSubcategory,
        };

        console.log("Sending Data to Backend:", requestData);

        try {
          const response = await axios.post(`${host}/api/marketplace/add`, requestData);
          console.log("Response from server:", response.data);
          alert("Listing added successfully!");
          setOpenModal(false);
          fetchListings();
        } catch (err) {
          console.error("Error submitting data:", err.response?.data || err.message);
          console.error("Axios POST error response:", err.response);
          console.error("Axios POST error message:", err.message);
          alert(`Submission failed: ${err.response?.data?.message || "Server Error"}`);
        }
      }
    );
  };



  return (
    <>



      {/* Main Content */}
      <Container
        maxWidth={false}
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #f7f4ef, #e6ddd1)',
          p: { xs: 2, sm: 4 },
          pt: { xs: '80px', sm: '110px' },
        }}
      >
        {/* Search & Filter Row */}
        <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
          <img src={Logo} alt="Marketplace Logo" style={{ height: "60px", marginRight: "10px" }} />
          <Typography variant="h3" fontWeight="bold" color="#333">Marketplace</Typography>
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={4} flexWrap="wrap">
          <TextField
            label="Search Username or Product"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 600, md: 900 },
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
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 2, sm: 0 },
            }}
          >
            + Sell Item
          </Button>
        </Box>




        {/* Tabs for All vs My Listings */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab label="All Listings" />
            <Tab label="My Listings" />
          </Tabs>
        </Box>

        {/* Upload Item Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Container maxWidth="md"> {/* Increased width to make the form wider */}
            <Paper
              elevation={5}
              sx={{
                p: 4,
                mt: 8,
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
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={() => {
                      const place = autocompleteRef.current.getPlace();
                      if (place.formatted_address) {
                        setFormData((prev) => ({ ...prev, address: place.formatted_address }));
                      }
                    }}
                  >
                    <TextField
                      label="Address"
                      name="address"
                      inputRef={addressInputRef}
                      value={formData.address}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={{ flex: 2, borderRadius: 2, bgcolor: "#f7f7f7" }}
                    />
                  </Autocomplete>



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
                </Box> {/* Close the Box wrapping category & subcategory */}
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
                </Box>
              </Box>

              {/* File Upload Input */}
              <>
                {/* Wrap Upload + Camera in a flex row */}
                {!selectedFile && (
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {/* Upload dropzone */}
                    <Box
                      sx={{
                        flex: 1,
                        width: 200,
                        p: 3,
                        border: "2px dashed #1976d2",
                        borderRadius: 3,
                        backgroundColor: "#f5f9ff",
                        textAlign: "center",
                        color: "#444",
                        transition: "0.3s",
                        "&:hover": { backgroundColor: "#e3f2fd" },
                        cursor: "pointer",
                      }}
                      component="label"
                    >
                      <Box sx={{ fontSize: 40, color: "#1976d2", mb: 1 }}>
                        <FaUpload />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Click to upload item image
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supported formats: JPG, PNG
                      </Typography>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Box>

                    {/* Camera button */}
                    <Button
                      variant="outlined"
                      sx={{ alignSelf: "center", minWidth: 140 }}
                      onClick={() => setCameraOpen(true)}
                    >
                      Use Camera
                    </Button>
                  </Box>
                )}

                {/* Preview + Discard */}
                {selectedFile && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Selected file: {selectedFile.name}</Typography>
                    <Box
                      component="img"
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        maxHeight: 400,
                        objectFit: 'contain',
                        mt: 1,
                        borderRadius: 2,
                        overflow: 'auto'
                      }}
                    />
                    <Button
                      variant="text"
                      color="error"
                      sx={{ mt: 1 }}
                      onClick={() => setSelectedFile(null)}
                    >
                      Discard
                    </Button>
                  </Box>
                )}

                {/* Submit button at the bottom */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setOpenModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!selectedFile}
                  >
                    Submit
                  </Button>
                </Box>
              </>
            </Paper>
          </Container>
        </Modal>


        {/* Grid Layout for Listings */}
        <Grid container spacing={3} justifyContent="center">
          {displayedListings.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item._id} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 300,                   // uniform card height
                  width: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  overflow: 'hidden',
                  backgroundColor: '#f8f2ec',
                  boxShadow: '0px 5px 15px rgba(0,0,0,0.15)',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 10px 25px rgba(0,0,0,0.3)',
                  },
                }}
                onClick={(e) => {
                  if (!e.target.closest('.chat-button')) {
                    setSelectedItem(item);
                    setOpenDetailModal(true);
                  }
                }}
              >
                {/* Three‑dots menu */}
                {user && item.userId?._id === user._id && (
                  <IconButton
                    aria-label="options"
                    onClick={(e) => handleMenuOpen(e, item)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}

                {/* Image fixed at top */}
                <CardMedia
                  component="img"
                  image={item.imageUrl}
                  alt={item.itemName}
                  sx={{
                    height: { xs: 150, sm: 200, md: 220 },
                    objectFit: 'cover',
                    width: '100%',
                    flexShrink: 0,
                  }}
                />

                {/* Content block */}
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  {/* Product Name */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {item.itemName}
                  </Typography>


                  {/* Address */}
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    📍 {item.address}
                  </Typography>
                  {/* Price */}
                  <Box mb={2}>
                    <Chip
                      label={`$${item.price}`}
                      sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'black',
                        borderRadius: '8px',
                        px: 1.5,
                        py: 0.5,
                        boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Box>

                  {/* Push the button to the bottom of the card */}
                  <Box mt="auto">
                    <Button
                      className="chat-button"
                      variant="contained"
                      startIcon={<ChatIcon />}
                      fullWidth
                      sx={{
                        borderRadius: '8px',
                        backgroundColor: '#073574',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#05204d' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openChat(item.userId);
                      }}
                    >
                      Chat with Seller
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>



        {/* ChatBox Model */}
        <Modal open={openChatbox} onClose={() => setOpenChatbox(false)}>
          <Box width="50%" height="50%" position="absolute" left='28%' top='25%' >

            {chatUser && (
              <>
                <Chatbox userId={chatUser._id} username={chatUser.name} />
              </>
            )}

          </Box>
        </Modal>





        {/* Open Item Dialog */}

        <Dialog
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 10px 30px rgba(0,0,0,0.3)',
              background: 'linear-gradient(135deg, #f7f4ef 0%, #e6ddd1 100%)',
            }
          }}
        >
          <DialogTitle sx={{ backgroundColor: '#073574', color: '#fff', m: 0, p: 2 }}>
            <Box
              onClick={() => navigate(`/profile/${selectedItem.userId?._id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer'
              }}
            > Sold by :
              <Avatar
                src={selectedItem?.userId?.profileImage || '/default-avatar.png'}
                sx={{ width: 40, height: 40, border: '2px solid #fff' }}
              />
              <Typography variant="h6" fontWeight="bold" color="#fff">
                {selectedItem?.userId?.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 3, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Box
                    component="img"
                    src={selectedItem.imageUrl}
                    alt={selectedItem.itemName}
                    sx={{ width: '100%', height: '100%', borderRadius: 2, objectFit: 'cover' }}
                  />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Item Name: {selectedItem.itemName}
                  </Typography>
                  <Typography variant="body2">Category: {selectedItem.category}</Typography>
                  <Typography variant="body2">Subcategory: {selectedItem.subcategory}</Typography>
                  <Typography variant="body2">Description: {selectedItem.description}</Typography>
                  <Typography variant="body2">Price: 💰 ${selectedItem.price}</Typography>
                  <Typography variant="body2">Location: 📍 {selectedItem.address}</Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, backgroundColor: 'linear-gradient(135deg, #f7f4ef 0%, #e6ddd1 100%)' }}>
            <Button variant="outlined" onClick={() => setOpenDetailModal(false)}>
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<ChatIcon />}
              sx={{
                ml: 2,
                backgroundColor: '#073574',
                color: '#fff',
                '&:hover': { backgroundColor: '#05204d' },
              }}
              onClick={() => {
                openChat(selectedItem.userId);
                setOpenDetailModal(false);
              }}
            >
              Chat with Seller
            </Button>
          </DialogActions>
        </Dialog>


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
      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 3, mt: 10, textAlign: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                '&:hover .hoverOverlay': { opacity: 1 }
              }}
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                style={{ width: '100%', borderRadius: 4 }}
              />
              <Box
                className="hoverOverlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <CameraAltIcon sx={{ fontSize: 50, color: 'white' }} />
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{ mt: 2, mr: 1 }}
              onClick={handleCapture}
            >
              Capture
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setCameraOpen(false)}
            >
              Cancel
            </Button>
          </Paper>
        </Container>
      </Modal>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleToggleSold(menuItem._id, menuItem.sold);
            handleMenuClose();
          }}
        >
          {menuItem?.sold ? 'Mark as Unsold' : 'Mark as Sold'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(menuItem._id);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default Marketplace;
