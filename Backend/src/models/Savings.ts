const mongoose = require("mongoose");

import type { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";

export interface ISaving extends Document {
    userId: string;
    title: string;
    description?: string;
    targetAmount?: number;
    startDate: Date;
    endDate?: Date;
    currentAmount: number;
    status: "active" | "completed" | "cancelled";
    date: Date;
}

const SavingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    currentAmount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
});

// check if goal is reached automatically
SavingSchema.pre("save", function (this: ISaving, next: CallbackWithoutResultAndOptionalError) {
    if (this.targetAmount && this.currentAmount >= this.targetAmount) {
        this.status = "completed";
    }
    next();
});


/** @type {Model<ISaving>} */
const Saving = mongoose.model("Saving", SavingSchema);

module.exports = Saving;