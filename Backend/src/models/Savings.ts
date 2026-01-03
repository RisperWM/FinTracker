const mongoose = require("mongoose");
import type { Document, CallbackWithoutResultAndOptionalError } from "mongoose";

export interface ISaving extends Document {
    userId: string;
    title: string;
    description?: string;
    type: "saving" | "loan" | "debt"; 
    targetAmount: number;
    currentAmount: number;
    interestRate?: number;
    startDate: Date;
    endDate?: Date;
    status: "active" | "completed" | "cancelled";
    date: Date;
}

const SavingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ["saving", "loan", "debt"],
        required: true,
        default: "saving"
    },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    interestRate: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

/**
 * 🔹 Lifecycle Logic:
 * For Savings: Goal reached when currentAmount >= targetAmount.
 * For Loans/Debts: Goal reached (repaid) when currentAmount >= targetAmount.
 */
SavingSchema.pre("save", function (this: ISaving, next: CallbackWithoutResultAndOptionalError) {
    if (this.targetAmount && this.currentAmount >= this.targetAmount) {
        this.status = "completed";
    } else if (this.currentAmount < this.targetAmount && this.status === "completed") {
        // Revert to active if amount is edited to be less than target
        this.status = "active";
    }
    next();
});

const Saving = mongoose.model("Saving", SavingSchema);

module.exports = Saving;