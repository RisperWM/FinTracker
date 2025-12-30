const mongoose = require("mongoose");
import type { Document, Model } from "mongoose"; // types only

export interface ITransaction extends Document {
    userId: string;
    // accountId: string;
    type: "income" | "expense" | "transfer";
    category: string;
    amount: number;
    description?: string;
    date: Date;
    goalId?: string;
    referenceId?:string;
}

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    // accountId: { type: String, required: true },
    type: { type: String, enum: ["income", "expense", "transfer"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    goalId: { type: String },
    referenceId: { type: String, default: null }
});

/** @type {Model<ITransaction>} */
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
