const mongoose = require("mongoose");
import type { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";

export interface IBudget extends Document {
    userId: string;
    title: string;
    description?: string;
    targetAmount?: number;
    currentAmount: number;
    startDate: Date;
    endDate?: Date;
    status: "active" | "completed" | "cancelled";
    deductAsExpense: boolean;
    createdAt: Date;
}

const BudgetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number },
    currentAmount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    deductAsExpense: { type: Boolean, default: false }, // 👈 user can choose if expenses count
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active",
    },
    createdAt: { type: Date, default: Date.now },
});

BudgetSchema.pre("save", function (this: IBudget, next: CallbackWithoutResultAndOptionalError) {
    if (this.targetAmount && this.currentAmount >= this.targetAmount) {
        this.status = "completed";
    }
    next();
});

/** @type {Model<IBudget>} */
const Budget = mongoose.model("Budget", BudgetSchema);

module.exports = Budget;