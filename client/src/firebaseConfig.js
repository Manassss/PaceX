// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD-cG5FUYp3BtDn1MM6dSqwF4U5vBzFYQ4",
    authDomain: "uniconnect-b0f89.firebaseapp.com",
    projectId: "uniconnect-b0f89",
    storageBucket: "uniconnect-b0f89.firebasestorage.app",
    messagingSenderId: "813462086599",
    appId: "1:813462086599:web:d3c0f9299e2ca55d72afe2",
    measurementId: "G-VR81083ESP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };