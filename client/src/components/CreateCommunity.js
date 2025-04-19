import React, { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { host } from '../components/apinfo';
const CreateCommunity = ({ onClose, userId }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [rules, setRules] = useState("");

    const handleImageUpload = async (file) => {
        if (!file) {
            alert("Please select an image first!");
            return;
        }
        const storageRef = ref(storage, `communityCovers/${userId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    console.log(`Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
                },
                (error) => {
                    console.error("Upload error:", error);
                    alert("Upload failed. Check Firebase Storage permissions.");
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("Downloaded URL:", downloadURL);
                    setCoverImageUrl(downloadURL);
                    resolve(downloadURL);
                }
            );
        });
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = coverImageUrl;
            if (coverImage && !coverImageUrl) {
                imageUrl = await handleImageUpload(coverImage);
            }
            const payload = {
                name: name,
                description: description,
                createdBy: userId,
                coverImage: imageUrl,
                rules: rules.split("\n").map(rule => rule.trim()).filter(rule => rule !== ""),
                members: [{ userId, role: "admin" }],
            }
            console.log("payload", payload)
            const response = await axios.post(`${host}/api/community`, payload);
            console.log("Community Created:", response.data);
            onClose();
        } catch (error) {
            console.error("Error creating community:", error.response?.data || error.message);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Create New Community
            </Typography>
            <TextField
                fullWidth
                label="Community Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
                style={{ marginBottom: "10px" }}
            />
            <TextField
                fullWidth
                label="Community Rules (Each rule on a new line)"
                variant="outlined"
                multiline
                rows={4}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                Create
            </Button>
        </Box>
    );
};

export default CreateCommunity;