const admin = require("firebase-admin");
const serviceAccount = require("./uniconnect-b0f89-firebase-adminsdk-fbsvc-938c91f085.json"); // Your Firebase private key JSON

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;