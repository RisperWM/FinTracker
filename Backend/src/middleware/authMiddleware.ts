const admin = require("../firebaseAdmin");

function authenticate(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken: any) => {
            req.user = { uid: decodedToken.uid, email: decodedToken.email || "" };
            next();
        })
        .catch((error:any) => {
            console.error("🔥 verifyIdToken error:", error);
            res.status(401).json({ message: "Unauthorized error", error: error.message });
        });

}

module.exports = { authenticate };
