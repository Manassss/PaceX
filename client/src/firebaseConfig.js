// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.firebaseapiKey,
    authDomain: process.env.firebaseauthDomain,
    projectId: process.env.firebaseprojectId,
    storageBucket: process.env.firebasestorageBucket,
    messagingSenderId: process.env.firebasemessagingSenderId,
    appId: process.env.firebaseappId,
    measurementId: process.env.firebasemeasurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };