const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const getCleanKey = (key:any) => {
    if (!key) return undefined;
    return key
        .replace(/\\n/g, '\n')
        .replace(/^"(.*)"$/, '$1')
        .trim();
};

const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: getCleanKey(process.env.FIREBASE_PRIVATE_KEY),
};

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin initialized");
    } catch (error:any) {
        console.error("❌ Initialization Error:", error.message);
    }
}

module.exports = admin;