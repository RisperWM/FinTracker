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
        console.log(transactions)

        res.status(200).json({ success: true, transactions });
    } catch (err: any) {
        console.log(err)
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
// Update an existing transaction
const updateTransaction = async (req:any, res:any) => {
    try {
        const { id } = req.params; // Get ID from URL
        const { type, category, amount, description, date, goalId } = req.body;

        // Find the transaction first
        let transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        // Optional: Check if the transaction belongs to the requesting user
        // if (transaction.userId.toString() !== req.body.userId) {
        //     return res.status(403).json({ success: false, message: "Unauthorized" });
        // }

        // Update fields
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.amount = amount || transaction.amount;
        transaction.description = description || transaction.description;
        transaction.goalId = goalId || transaction.goalId;
        if (date) transaction.date = new Date(date);

        const updatedTransaction = await transaction.save();

        res.status(200).json({ success: true, transaction: updatedTransaction });
    } catch (err:any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a transaction
const deleteTransaction = async (req:any, res:any) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByIdAndDelete(id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        res.status(200).json({ success: true, message: "Transaction deleted successfully" });
    } catch (err:any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Export using CommonJS
module.exports = {
    addTransaction,
    getTransactions,
    getDashboard,
    updateTransaction,
    deleteTransaction,
};
