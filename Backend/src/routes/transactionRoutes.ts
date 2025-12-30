const express = require("express");
const { addTransaction, getTransactions, getDashboard, updateTransaction, deleteTransaction } = require("../controllers/transactionController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes protected
router.use(authenticate);

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/dashboard", getDashboard);
router.put('/update/:id', updateTransaction);
router.delete('/delete/:id', deleteTransaction);

module.exports = router;
