const express = require("express");
const router = express.Router();
const {
    createSaving,
    depositToSaving,
    withdrawFromSaving,
    deleteSaving,
    updateSaving,
    getSavings,      // Fetches "saving" type
    getLoans,        // Fetches "loan" type 🔹 Added
    getDebts,        // Fetches "debt" type 🔹 Added
    getSavingById,
} = require("../controllers/savingController");
const { authenticate } = require("../middleware/authMiddleware");

// --- 🔹 CORE CRUD ---

// @route   POST /api/savings
// @desc    Create a plan (Saving, Loan, or Debt based on 'type' in body)
router.post("/", authenticate, createSaving);

// @route   GET /api/savings
// @desc    Get all savings for logged-in user
router.get("/", authenticate, getSavings);

// @route   GET /api/savings/loans
// @desc    Get all loans for logged-in user 🔹 Added
router.get("/loans", authenticate, getLoans);

// @route   GET /api/savings/debts
// @desc    Get all debts for logged-in user 🔹 Added
router.get("/debts", authenticate, getDebts);

// @route   GET /api/savings/:id
// @desc    Get a single record by ID
router.get("/:id", authenticate, getSavingById);

// @route   PUT /api/savings/:id
// @desc    Update a record
router.put("/:id", authenticate, updateSaving);

// @route   DELETE /api/savings/:id
// @desc    Delete a record
router.delete("/:id", authenticate, deleteSaving);


// --- 🔹 MONEY FLOW ---

// @route   POST /api/savings/:id/deposit
// @desc    Deposit / Repayment / Debt Clearing
router.post("/:id/deposit", authenticate, depositToSaving);

// @route   POST /api/savings/:id/withdraw
// @desc    Withdraw / Re-borrowing / Adjustment
router.post("/:id/withdraw", authenticate, withdrawFromSaving);

module.exports = router;