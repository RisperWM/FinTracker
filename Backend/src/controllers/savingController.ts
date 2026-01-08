const Saving = require("../models/Savings");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/**
 * 🔹 CREATE RECORD
 * Lending (Loan) -> Wallet DECREASE (-)
 * Borrowing (Debt) -> Wallet INCREASE (+)
 * Saving -> No immediate wallet impact (happens on first deposit)
 */
const createSaving = async (req: any, res: any) => {
    try {
        const userId = req.user.uid;
        const { title, description, targetAmount, type, startDate, endDate, interestRate } = req.body;
        console.log('body=', req.body)

        const record = await Saving.create({
            userId, title, description, type, targetAmount,
            currentAmount: 0,
            interestRate: interestRate || 0,
            startDate, endDate, status: "active",
        });
        console.log('savings type=', type)
        // Auto-log transaction for Loans and Debts
        if (type === "loan" || type === "debt") {
            const isLoan = type === "loan";
            const transaction=await Transaction.create({
                userId,
                type: "transfer",
                amount: targetAmount,
                category: isLoan ? "Loan Given" : "Debt Taken",
                // "back to balance" triggers (+) logic in frontend for Debts
                description: isLoan
                    ? `Lent money for: ${title}`
                    : `Borrowed money for: ${title} back to balance`,
                goalId: record._id,
                date: new Date(),
            });
            console.log("log transaction=", transaction)
        }
        

        res.status(201).json({ success: true, data: record });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 🔹 UNIVERSAL DEPOSIT (Adding money to a record)
 * Savings Deposit -> Wallet DECREASE (-)
 * Loan Repayment (Receiving money you lent) -> Wallet INCREASE (+)
 * Debt Repayment (Paying back money you borrowed) -> Wallet DECREASE (-)
 */
const depositToSaving = async (req: any, res: any) => {
    try {
        const { amount } = req.body;
        const userId = req.user.uid;
        const record = await Saving.findById(req.params.id);
        console.log('req.body =',req.body)

        if (!record) return res.status(404).json({ success: false, message: "Record not found" });
        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });

        const remainingPrincipal = record.targetAmount - record.currentAmount;
        let transferAmount = amount;
        let extraAmount = 0;

        // Logic for overflow (Interest/Profit)
        if (amount > remainingPrincipal && (record.type === "loan" || record.type === "debt")) {
            transferAmount = remainingPrincipal;
            extraAmount = amount - remainingPrincipal;
        }

        // 1. Update Goal Amount
        record.currentAmount += transferAmount;
        if (record.currentAmount >= record.targetAmount) {
            record.status = "completed";
        }
        await record.save();

        // 2. Log Wallet Transaction based on Type
        let walletDescription = "";
        if (record.type === "loan") {
            // Money coming back to you
            walletDescription = `Repayment received for ${record.title} back to balance`;
        } else if (record.type === "debt") {
            // Money leaving you to pay a debt
            walletDescription = `Debt repayment for ${record.title}`;
        } else {
            // Money leaving you to go to savings
            walletDescription = `Deposit to savings: ${record.title}`;
        }

        await Transaction.create({
            userId,
            type: "transfer",
            amount: transferAmount,
            category: record.type === "saving" ? "Savings" : "Debt Repayment",
            description: walletDescription,
            goalId: record._id,
            date: new Date(),
        });

        // 3. Log Interest (Extra) if applicable
        if (extraAmount > 0) {
            const extraType = record.type === "debt" ? "expense" : "income";
            await Transaction.create({
                userId,
                type: extraType,
                amount: extraAmount,
                category: "Interest",
                description: record.type === "debt"
                    ? `Interest paid on ${record.title}`
                    : `Interest received from ${record.title} back to balance`,
                goalId: record._id,
                date: new Date(),
            });
        }

        res.json({ success: true, data: record });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 🔹 UNIVERSAL WITHDRAW (Moving money back to wallet)
 * Only allowed for 'saving' type.
 * Savings Withdraw -> Wallet INCREASE (+)
 */
const withdrawFromSaving = async (req: any, res: any) => {
    try {
        const { amount } = req.body;
        const userId = req.user.uid;
        const record = await Saving.findById(req.params.id);

        if (!record) return res.status(404).json({ success: false, message: "Not found" });

        // Guard: You don't "withdraw" from a loan you gave or a debt you owe.
        if (record.type !== "saving") {
            return res.status(400).json({ success: false, message: "Direct withdrawal only allowed for Savings" });
        }

        if (amount > record.currentAmount) {
            return res.status(400).json({ success: false, message: "Insufficient savings" });
        }

        record.currentAmount -= amount;
        await record.save();

        await Transaction.create({
            userId,
            type: "transfer",
            amount,
            category: "Goal Withdrawal",
            description: `Withdrawal from ${record.title} back to balance`, // INFLOW (+)
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
        const filter: { userId: string; type?: string } = { userId };
        if (req.query.type) filter.type = req.query.type as string;

        const data = await Saving.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSavingById = async (req: any, res: any) => {
    try {
        const record = await Saving.findById(req.params.id);
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
        const record = await Saving.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json({ success: true, data: record });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteSaving = async (req: any, res: any) => {
    try {
        await Saving.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted successfully" });
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
    getSavingById,
};