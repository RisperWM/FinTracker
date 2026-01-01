const express = require("express");
const { addTransaction, getTransactions, getDashboard, updateTransaction, deleteTransaction, getTotalBalance } = require("../controllers/transactionController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes protected
router.use(authenticate);

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/dashboard", getDashboard);
router.get("/balance", getTotalBalance);
router.put('/update/:id', updateTransaction);
router.delete('/delete/:id', deleteTransaction);

module.exports = router;
