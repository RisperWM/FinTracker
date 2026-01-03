const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // We trim and ensure the replacement is globally applied
    private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY
        : undefined,
};

if (!admin.apps.length) {
    admin.initializeApp({
        // @ts-ignore - this prevents TS from complaining about the object type
        credential: admin.credential.cert(serviceAccount),
    });
}
module.exports= admin;