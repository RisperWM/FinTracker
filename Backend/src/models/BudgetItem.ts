const mongoose = require("mongoose");
import type { Schema, Document } from "mongoose";

export interface IBudgetItem extends Document {
    budgetId: string;
    title: string;
    description?: string;
    amount: number;
    spentAmount: number;
    createdAt: Date;
    updatedAt?: Date;
}

const BudgetItemSchema = new mongoose.Schema({
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

// --- Helper function to recalculate Budget's total currentAmount ---
async function updateBudgetCurrentAmount(budgetId: string) {
    const Budget = mongoose.model("Budget");
    const BudgetItem = mongoose.model("BudgetItem");

    const totalSpent = await BudgetItem.aggregate([
        { $match: { budgetId: new mongoose.Types.ObjectId(budgetId) } },
        { $group: { _id: null, total: { $sum: "$spentAmount" } } },
    ]);

    const newAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;

    await Budget.findByIdAndUpdate(budgetId, { currentAmount: newAmount });
}

// --- Hooks to keep Budget’s currentAmount in sync ---
BudgetItemSchema.post("save", async function (doc: IBudgetItem) {
    await updateBudgetCurrentAmount(doc.budgetId);
});

BudgetItemSchema.post("findOneAndUpdate", async function (doc: IBudgetItem) {
    if (doc) await updateBudgetCurrentAmount(doc.budgetId);
});

BudgetItemSchema.post("remove", async function (doc: IBudgetItem) {
    if (doc) await updateBudgetCurrentAmount(doc.budgetId);
});

/** @type {Model<IBudgetItem>} */
const BudgetItem = mongoose.model("BudgetItem", BudgetItemSchema);

module.exports = BudgetItem;
