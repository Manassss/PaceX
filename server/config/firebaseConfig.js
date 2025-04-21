const admin = require("firebase-admin");
const serviceAccount =
{
    "type": process.env.FirebaseTYPE,
    "project_id": process.env.FirebasePROJECTID,
    "private_key_id": process.env.FirebaseKEYID,
    "private_key": process.env.FirebaseKEY,
    "client_email": process.env.FirebaseEMAIL,
    "client_id": process.env.FirebaseID,
    "auth_uri": process.env.FirebaseAUTHURI,
    "token_uri": process.env.FirebaseTOKEN,
    "auth_provider_x509_cert_url": process.env.FirebaseAUTHURL,
    "client_x509_cert_url": process.env.FirebaseCLIENTURL,
    "universe_domain": process.env.FirebaseDOMAIN
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;