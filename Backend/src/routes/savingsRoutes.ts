const express = require("express");
const router = express.Router();
const {
    createSaving,
    depositToSaving,
    withdrawFromSaving,
    getSavings,
    getSavingById,
    updateSaving,
    deleteSaving
} = require("../controllers/savingController");
const { authenticate } = require("../middleware/authMiddleware");

// 1. Diagnostics (Fixed syntax: used /(.*) instead of *)
// If you hit /api/savings/deposit/test and see this message, the routing is fine.
router.get("/test", (req: any, res: any) => {
    res.send("Savings route file is reachable.");
});
console.log('savings route')
router.use((req:any, res:any, next:any) => {
    console.log(`Savings Router hit: ${req.method} ${req.url}`);
    next();
});

// 2. Authentication
router.use(authenticate);

// 3. 🔹 SPECIFIC ACTION ROUTES (MUST BE AT THE TOP)
// These handle /api/savings/deposit/:id
router.post("/deposit/:id", depositToSaving);
router.post("/withdraw/:id", withdrawFromSaving);

// 4. 🔹 BASE ROUTES
router.post("/", createSaving);
router.get("/", getSavings);

// 5. 🔹 GENERIC ID ROUTES (MUST BE AT THE BOTTOM)
// If these are above deposit/:id, they will steal the request!
router.get("/:id", getSavingById);
router.put("/:id", updateSaving);
router.delete("/:id", deleteSaving);

module.exports = router;