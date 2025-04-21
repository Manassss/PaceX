import React from 'react';
import {
    Modal,
    Box,
    Typography,
    List,
    ListItem,
    Avatar,
    ListItemText,
    Button,
    ListItemAvatar,
    ListItemSecondaryAction,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FollowRequest = ({ open, onClose, requestProfiles, handleRespondRequest }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Follow Requests</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {requestProfiles.length > 0 ? (
                    <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {requestProfiles.map((user) => (
                            <ListItem key={user._id}>
                                <ListItemAvatar>
                                    <Avatar src={user.profileImage} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.name}
                                    secondary={`@${user.username}`}
                                />
                                <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleRespondRequest(user._id, 'approve')}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleRespondRequest(user._id, 'reject')}
                                    >
                                        Reject
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
                        No follow requests.
                    </Typography>
                )}
            </Box>
        </Modal>
    );
};

export default FollowRequest;