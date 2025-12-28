const mongoose = require("mongoose");
import type { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";

export interface IUserSettings extends Document {
    userId: string;
    autoDeductBudgetExpenses: boolean;
    currency?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSettingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    autoDeductBudgetExpenses: { type: Boolean, default: true },
    currency: { type: String, default: "KES" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


/** @type {Model<IUserSettings>} */
const UserSettings = mongoose.model("UserSettings", UserSettingsSchema);

module.exports = UserSettings;