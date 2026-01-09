const Transaction = require("../models/Transaction");
const Saving = require("../models/Savings"); // 🔹 Added import to query loan/debt goals
const mongoose = require("mongoose");

/**
 * Helper: Calculates the balance for a user up to a specific date.
 */
const calculateBalanceAtPoint = async (userId: string, date: Date) => {
    const stats = await Transaction.aggregate([
        {
            $match: {
                userId: userId,
                date: { $lte: date }
            }
        },
        {
            $group: {
                _id: null,
                income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
                transfer: { $sum: { $cond: [{ $eq: ["$type", "transfer"] }, "$amount", 0] } }
            }
        }
    ]);

    if (stats.length === 0) return 0;
    return (stats[0].income + stats[0].transfer) - stats[0].expense;
};

// --- 🔹 NEW: GET LOAN AMOUNT ---
const getLoanAmount = async (req: any, res: any) => {
    try {
        const { userId } = req.query;
        // Summing the remaining principal on all active loans given
        const loans = await Saving.find({ userId, type: "loan", status: "active" });
        const totalLoan = loans.reduce((sum: number, loan: any) =>
            sum + (loan.targetAmount - loan.currentAmount), 0);

        res.status(200).json({ success: true, amount: totalLoan });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- 🔹 NEW: GET DEBT AMOUNT ---
const getDebtAmount = async (req: any, res: any) => {
    try {
        const { userId } = req.query;
        // Summing the remaining principal on all active debts taken
        const debts = await Saving.find({ userId, type: "debt", status: "active" });
        const totalDebt = debts.reduce((sum: number, debt: any) =>
            sum + (debt.targetAmount - debt.currentAmount), 0);

        res.status(200).json({ success: true, amount: totalDebt });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- ADD TRANSACTION ---
const addTransaction = async (req: any, res: any) => {
    try {
        const { userId, type, category, amount, description, date, goalId, referenceId } = req.body;
        const transactionDate = date ? new Date(date) : new Date();

        const transaction = new Transaction({
            userId,
            type,
            category,
            amount: Number(amount),
            description,
            date: transactionDate,
            goalId,
            referenceId
        });

        await transaction.save();

        const balanceSnapshot = await calculateBalanceAtPoint(userId, transactionDate);
        transaction.currentBalance = balanceSnapshot;
        await transaction.save();

        res.status(201).json({
            success: true,
            transaction,
            currentBalance: balanceSnapshot
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- GET TRANSACTIONS ---
const getTransactions = async (req: any, res: any) => {
    try {
        const { userId, month, year } = req.query;
        let filter: Record<string, any> = { userId };

        if (month && year) {
            const start = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
            const end = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        }

        const transactions = await Transaction.find(filter).sort({ date: -1 });
        const globalBalance = await calculateBalanceAtPoint(userId as string, new Date());

        res.status(200).json({
            success: true,
            transactions,
            globalBalance
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- GET DASHBOARD ---
const getDashboard = async (req: any, res: any) => {
    try {
        const { userId, month, year } = req.query;
        if (!month || !year) return res.status(400).json({ success: false, message: "Month/Year required" });

        const start = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
        const end = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: start, $lte: end },
        });

        const totalIncome = transactions
            .filter((t: any) => t.type === "income")
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t: any) => t.type === "expense")
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const totalTransfer = transactions
            .filter((t: any) => t.type === "transfer")
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        res.status(200).json({
            success: true,
            totalIncome,
            totalExpense,
            totalTransfer,
            balance: (totalIncome + totalTransfer) - totalExpense,
            transactions,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- GET TOTAL BALANCE ---
const getTotalBalance = async (req: any, res: any) => {
    try {
        const { userId } = req.query;
        const balance = await calculateBalanceAtPoint(userId as string, new Date());

        res.status(200).json({
            success: true,
            balance: balance
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- UPDATE TRANSACTION ---
const updateTransaction = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const transaction = await Transaction.findByIdAndUpdate(id, updates, { new: true });
        if (!transaction) return res.status(404).json({ success: false, message: "Not found" });

        const newSnapshot = await calculateBalanceAtPoint(transaction.userId, transaction.date);
        transaction.currentBalance = newSnapshot;
        await transaction.save();

        res.status(200).json({ success: true, transaction });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- DELETE TRANSACTION ---
const deleteTransaction = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByIdAndDelete(id);
        if (!transaction) return res.status(404).json({ success: false, message: "Not found" });

        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    getDashboard,
    updateTransaction,
    deleteTransaction,
    getTotalBalance,
    getLoanAmount,   // 🔹 Exported
    getDebtAmount    // 🔹 Exported
};