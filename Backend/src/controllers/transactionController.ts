const Transaction = require("../models/Transaction");

// Add new transaction
const addTransaction = async (req: any, res: any) => {
    try {
        const { userId, type, category, amount, description, date, goalId } = req.body;

        const transaction = await Transaction.create({
            userId,
            type,
            category,
            amount,
            description,
            date: date ? new Date(date) : new Date(),
            goalId,
        });

        res.status(201).json({ success: true, transaction });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all transactions for a user (optionally filtered by month)
const getTransactions = async (req: any, res: any) => {
    try {
        const { userId, month, year } = req.query;

        let filter: any = { userId };

        if (month && year) {
            const start = new Date(parseInt(year), parseInt(month) - 1, 1);
            const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        }

        const transactions = await Transaction.find(filter).sort({ date: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Dashboard summary
const getDashboard = async (req: any, res: any) => {
    try {
        const { userId, month, year } = req.query;

        if (!month || !year) return res.status(400).json({ success: false, message: "Month and year required" });

        const start = new Date(parseInt(year), parseInt(month) - 1, 1);
        const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

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

        const balance = totalIncome - totalExpense;

        res.status(200).json({
            success: true,
            totalIncome,
            totalExpense,
            balance,
            transactions,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Export using CommonJS
module.exports = {
    addTransaction,
    getTransactions,
    getDashboard,
};
