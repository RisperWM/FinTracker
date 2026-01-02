const mongoose = require("mongoose");
import type { Document, Model } from "mongoose";

export interface IHabitLog extends Document {
    habitId: string;
    userId: string;
    date: string;
    status: 'Completed' | 'Skipped' | 'Failed';
    comment?: string;
}

const HabitLogSchema = new mongoose.Schema({
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
    userId: { type:String, required:true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Completed', 'Skipped', 'Failed'],
        default: 'Completed'
    },
    comment: { type: String, trim: true },
});


/** @type {Model<IHabitLog>} */
const HabitLog = mongoose.model("HabitLog", HabitLogSchema);

module.exports = HabitLog;
