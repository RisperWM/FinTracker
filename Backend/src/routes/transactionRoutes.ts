const express = require("express");
const { addTransaction, getTransactions, getDashboard, updateTransaction, deleteTransaction, getTotalBalance, getLoanAmount, getDebtAmount } = require("../controllers/transactionController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/dashboard", getDashboard);
router.get("/balance", getTotalBalance);
router.put('/update/:id', updateTransaction);
router.delete('/delete/:id', deleteTransaction);
router.get("/loans", getLoanAmount);
router.get("/debts", getDebtAmount);

module.exports = router;
