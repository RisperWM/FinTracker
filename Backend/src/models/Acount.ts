const mongoose = require("mongoose");
import type { Document, Model } from "mongoose";

export interface IAccount extends Document {
    userId: string;
    name: string;
    type: "bank" | "savings" | "loan" | "debt";
    balance: number;
}

const accountSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["bank", "savings", "loan", "debt"], required: true },
    balance: { type: Number, default: 0 },
});

/** @type {Model<IAccount>} */
const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
