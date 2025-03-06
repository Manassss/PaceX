const admin = require("firebase-admin");
const serviceAccount = require("./uniconnect-b0f89-firebase-adminsdk-fbsvc-961e1f8662.json"); // Your Firebase private key JSON

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;