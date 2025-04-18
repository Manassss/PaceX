import React, { useState, Component } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Modal,
  Tooltip,
  TextField,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import { FaUpload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import CameraCapture from './CameraComponent';

/** Catches errors inside CameraCapture so the modal won’t crash */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error("ErrorBoundary caught:", err, info);
    if (this.props.onError) this.props.onError(err);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default function AddPost({ open: isOpen, onClose }) {
  // text + navigation + auth
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // images + preview
  const [postImages, setPostImages] = useState([]); // all uploaded URLs
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // camera modal
  const [cameraOpen, setCameraOpen] = useState(false);

  // handle drag‑and‑click upload
  const handleUploadChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // upload a File, return Promise<string> → downloadURL
  const uploadToFirebase = file =>
    new Promise((resolve, reject) => {
      const path = `postPictures/${user._id}/${file.name}`;
      const task = uploadBytesResumable(ref(storage, path), file);
      task.on(
        'state_changed',
        snap => console.log(`Upload ${(snap.bytesTransferred / snap.totalBytes * 100).toFixed(0)}%`),
        reject,
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });

  // camera capture callback
  const handleCameraUpload = url => {
    setCameraOpen(false);
    setPreviewUrl(url);
    setPostImages(prev => [...prev, url]);
  };

  // submit post
  const handleSubmit = async () => {
    try {
      // 1) upload coverFile if present
      if (coverFile) {
        const url = await uploadToFirebase(coverFile);
        setPostImages(prev => [...prev, url]);
        setCoverFile(null);
      }

      // 2) post content + all image URLs
      await axios.post('http://localhost:5001/api/posts/add', {
        userId: user._id,
        userName: user.name,
        content: content.trim() || ' ',
        images: postImages,
      });

      // 3) reset + navigate
      setContent('');
      setPostImages([]);
      setPreviewUrl('');
      navigate('/userhome');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,                     // fixed size
          height: 700,
          bgcolor: '#f8f2ec',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          overflowY: 'auto'
        }}
      >
        {/* Title */}
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          Create a New Post
        </Typography>

        {/* Top controls: Upload & Camera side by side */}
        {!previewUrl && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            {/* Upload area */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                border: '2px dashed #1976d2',
                borderRadius: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#e3f2fd' }
              }}
            >
              <Box component="label">
                <Box sx={{ fontSize: 32, color: '#1976d2', mb: 1 }}><FaUpload /></Box>
                <Typography>Upload Image</Typography>
                <input type="file" accept="image/*" hidden onChange={handleUploadChange} />
              </Box>
            </Box>
            {/* Camera button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Tooltip title="Capture from Camera">
                <IconButton onClick={() => setCameraOpen(true)} sx={{ fontSize: 40 }}>
                  <CameraAltIcon sx={{ fontSize: 40 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* Preview area */}
        {previewUrl && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box
              component="img"
              src={previewUrl}
              alt="Preview"
              sx={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: 2
              }}
            />
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 2 }}
              onClick={() => {
                setPreviewUrl('');
                setCoverFile(null);
              }}
            >
              Discard
            </Button>
          </Box>
        )}

        {/* "What's on your mind?" textarea */}
        <TextField
          fullWidth
          multiline
          minRows={5}
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
          sx={{ mb: 3, bgcolor: '#fff', borderRadius: 1 }}
        />

        {/* Post button */}
        <Button fullWidth variant="contained" onClick={handleSubmit}>
          Post
        </Button>

        {/* Camera modal */}
        <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <ErrorBoundary onError={() => setCameraOpen(false)}>
              <CameraCapture
                userId={user._id}
                onMediaUpload={handleCameraUpload}
                onError={err => {
                  console.error(err);
                  setCameraOpen(false);
                }}
              />
            </ErrorBoundary>
          </Box>
        </Modal>
      </Box>
    </Modal>
  );
}
