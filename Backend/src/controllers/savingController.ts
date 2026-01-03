const Saving = require("../models/Savings");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/**
 * Creates a record for a Saving Goal, a Loan, or a Debt.
 * type: "saving" | "loan" | "debt"
 */
const createSaving = async (req: any, res: any) => {
    try {
        const userId = req.user.uid;
        const { title, description, targetAmount, type, startDate, endDate, interestRate } = req.body;

        const record = await Saving.create({
            userId,
            title,
            description,
            type,
            targetAmount,
            currentAmount: 0,
            interestRate: interestRate || 0,
            startDate,
            endDate,
            status: "active",
        });

        res.status(201).json({ success: true, data: record });
    } catch (err: any) {
        console.error("createSavingError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 🔹 UNIVERSAL DEPOSIT (Repayment / Contribution)
 * Triggers "OUT" (Minus) on the Transaction Card
 */
const depositToSaving = async (req: any, res: any) => {
    try {
        const { amount } = req.body;
        const userId = req.user.uid;
        const record = await Saving.findById(req.params.id);

        if (!record) return res.status(404).json({ success: false, message: "Record not found" });
        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });

        const remainingPrincipal = record.targetAmount - record.currentAmount;
        let transferAmount = amount;
        let extraAmount = 0;

        // If paying more than the principal owed (Interest/Profit handling)
        if (amount > remainingPrincipal && (record.type === "loan" || record.type === "debt")) {
            transferAmount = remainingPrincipal;
            extraAmount = amount - remainingPrincipal;
        }

        // 1. Update the record amount
        record.currentAmount += transferAmount;
        await record.save();

        // 2. Log the Principal Transfer (OUT of wallet)
        const transferDesc = record.type === "saving"
            ? `Deposit to savings: ${record.title}`
            : `Repayment for ${record.title}`;

        await Transaction.create({
            userId,
            type: "transfer",
            amount: transferAmount,
            category: record.type === "saving" ? "Savings" : "Debt Repayment",
            description: transferDesc,
            goalId: record._id,
            date: new Date(),
        });

        // 3. Log the "Extra" if any (Interest Income or Expense)
        if (extraAmount > 0) {
            const extraType = record.type === "debt" ? "expense" : "income";
            await Transaction.create({
                userId,
                type: extraType,
                amount: extraAmount,
                category: "Interest/Gift",
                description: record.type === "debt"
                    ? `Interest paid on ${record.title}`
                    : `Bonus received from ${record.title}`,
                goalId: record._id,
                date: new Date(),
            });
        }

        res.json({
            success: true,
            data: record,
            principal: transferAmount,
            extra: extraAmount
        });
    } catch (err: any) {
        console.error("depositError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 🔹 UNIVERSAL WITHDRAW (Withdrawal / Borrowing)
 * Triggers "IN" (Plus) on the Transaction Card via "back to balance" keyword
 */
const withdrawFromSaving = async (req: any, res: any) => {
    try {
        const { amount } = req.body;
        const userId = req.user.uid;
        const record = await Saving.findById(req.params.id);

        if (!record) return res.status(404).json({ success: false, message: "Record not found" });

        // Block over-withdrawal from Savings
        if (record.type === "saving" && amount > record.currentAmount) {
            return res.status(400).json({ success: false, message: "Insufficient savings" });
        }

        record.currentAmount -= amount;
        await record.save();

        // 🔹 Using "back to balance" ensures the Frontend shows a "+" (IN)
        const withdrawDesc = record.type === "saving"
            ? `Withdrawal from ${record.title} back to balance`
            : `Borrowing:${record.title} back to balance`;

        await Transaction.create({
            userId,
            type: "transfer",
            amount,
            category: "Goal Withdrawal",
            description: withdrawDesc,
            goalId: record._id,
            date: new Date(),
        });

        res.json({ success: true, data: record });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 🔹 FETCHERS
 */

const getSavings = async (req: any, res: any) => {
    try {
        const userId = req.user.uid;
        const { type } = req.query;

        const filter: { userId: string; type?: any } = { userId };
        if (type) filter.type = type;

        const data = await Saving.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getLoans = async (req: any, res: any) => {
    try {
        const data = await Saving.find({ userId: req.user.uid, type: "loan" }).sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getDebts = async (req: any, res: any) => {
    try {
        const data = await Saving.find({ userId: req.user.uid, type: "debt" }).sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSavingById = async (req: any, res: any) => {
    try {
        const record = await Saving.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: record });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 🔹 UPDATES & DELETION
 */

const updateSaving = async (req: any, res: any) => {
    try {
        const record = await Saving.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.json({ success: true, data: record });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteSaving = async (req: any, res: any) => {
    try {
        await Saving.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Record deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createSaving,
    depositToSaving,
    withdrawFromSaving,
    deleteSaving,
    updateSaving,
    getSavings,
    getLoans,
    getDebts,
    getSavingById,
};