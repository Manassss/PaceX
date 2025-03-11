import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// ✅ Initialize Socket.IO connection
const socket = io("http://localhost:5001", {
    transports: ["websocket"],
});

function Notifications({ userId }) {
    useEffect(() => {
        if (!userId) return;

        const eventName = `notification-${userId}`;
        console.log(`📡 Listening for notifications on "${eventName}"`);

        const handleNotification = (notification) => {
            console.log("📩 New notification:", notification);

            let message = "";
            switch (notification.type) {
                case "like":
                    message = `Someone liked your post!`;
                    break;
                case "comment":
                    message = `Someone commented on your post!`;
                    break;
                case "follow":
                    message = `You have a new follower!`;
                    break;
                case "message":
                    message = `You received a new message!`;
                    break;
                default:
                    message = `New notification!`;
            }

            toast.info(message, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };

        // ✅ Listen for real-time notifications
        socket.on(eventName, handleNotification);

        return () => {
            socket.off(eventName, handleNotification);
        };
    }, [userId]);

    return null;
}

export default Notifications;
