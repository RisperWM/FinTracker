const express = require("express");
const router = express.Router();
const {
    createSaving,
    depositToSaving,
    withdrawFromSaving,
    deleteSaving,
    updateSaving,
    getSavings,
    getSavingById,
} = require("../controllers/savingController");
const { authenticate } = require("../middleware/authMiddleware");

// @route   POST /api/savings
// @desc    Create a saving plan
// @access  Private
router.post("/", authenticate, createSaving);

// @route   GET /api/savings
// @desc    Get all savings for logged-in user
// @access  Private
router.get("/", authenticate, getSavings);

// @route   GET /api/savings/:id
// @desc    Get a single saving plan by ID
// @access  Private
router.get("/:id", authenticate, getSavingById);

// @route   PUT /api/savings/:id
// @desc    Update a saving plan
// @access  Private
router.put("/:id", authenticate, updateSaving);

// @route   DELETE /api/savings/:id
// @desc    Delete a saving plan
// @access  Private
router.delete("/:id", authenticate, deleteSaving);

// @route   POST /api/savings/:id/deposit
// @desc    Deposit money into saving plan
// @access  Private
router.post("/:id/deposit", authenticate, depositToSaving);

// @route   POST /api/savings/:id/withdraw
// @desc    Withdraw money from saving plan
// @access  Private
router.post("/:id/withdraw", authenticate, withdrawFromSaving);

module.exports = router;
