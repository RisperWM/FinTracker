const admin = require("../firebaseAdmin");
const User = require("../models/User");

// Register new user
async function register(req: any, res: any) {
    const { email, password, firstname, middlename, surname, gender, phonenumber } = req.body;

    if (!email || !password || !firstname || !gender || !phonenumber) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Create user in MongoDB
        const newUser = new User({
            firebaseUid: userRecord.uid,
            firstname,
            middlename,
            surname,
            gender,
            phonenumber,
            email,
        });

        await newUser.save();

        return res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err: any) {
        console.error("Register Error:", err);
        return res.status(500).json({ message: err.message });
    }
}

// Login user
async function login(req: any, res: any) {
    const idToken = req.headers.authorization?.split(" ")[1];
    if (!idToken) return res.status(401).json({ message: "Missing ID token" });


    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        return res.status(200).json({ message: "Login successful", user });
    } catch (err: any) {
        console.error("Login Error:", err);
        return res.status(401).json({ message: "Invalid token", error: err.message });
    }
}

// Logout user (revoke tokens)
async function logout(req: any, res: any) {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ message: "Missing UID" });
    }

    try {
        await admin.auth().revokeRefreshTokens(uid);
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err: any) {
        console.error("Logout Error:", err);
        return res.status(500).json({ message: err.message });
    }
}

const getCurrentUser = async (req: any, res: any) => {
    // 1. Get the token from the header (similar to login)
    const idToken = req.headers.authorization?.split(" ")[1];
    if (!idToken) return res.status(401).json({ message: "Missing ID token" });

    try {
        // 2. Verify the token to get the UID
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 3. Find the user in MongoDB
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return res.status(404).json({ message: "User not found in database" });

        // 4. Return the user
        res.status(200).json(user);
    } catch (err) {
        console.error("GetCurrentUser Error:", err);
        // 5. Return 401 for token errors
        res.status(401).json({ message: "Invalid token or server error"});
    }
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
};
