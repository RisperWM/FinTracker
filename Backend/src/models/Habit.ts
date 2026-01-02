const mongoose = require("mongoose");
import type { Document, Model } from "mongoose";
export type HabitCategory = 'Career' | 'Education' | 'Spiritual' | 'Health & Wellness' | 'Financial' | 'Social' | 'Other';
export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface IHabit extends Document {
    userId: string;
    title: string;
    description?: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    startDate: Date;
    endDate?: Date;
    color: string;
    icon: string;
    reminderTime?: string; // e.g., "08:00"
    isActive: boolean;
}

const HabitSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
        type: String,
        enum: ['Career', 'Education', 'Spiritual', 'Health & Wellness', 'Financial', 'Social', 'Other'],
        default: 'Other'
    },
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
        default: 'Daily'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    color: { type: String, default: '#FFB300' },
    icon: { type: String, default: 'extension-puzzle-outline' },
    reminderTime: { type: String },
    isActive: { type: Boolean, default: true },
});

/** @type {Model<IHabit>} */
const Habit = mongoose.model("Habit", HabitSchema);

module.exports = Habit;
