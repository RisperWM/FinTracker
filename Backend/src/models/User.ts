const mongoose = require("mongoose");
import type { Document, Model } from "mongoose"; // types only

interface IUser extends Document {
    firebaseUid: string;
    firstname: string;
    middlename?: string;
    surname?: string;
    gender: "male" | "female" | "other";
    phonenumber: string;
    email?: string;
    createdAt: Date;
}

// Create schema (no generics here)
const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    firstname: { type: String, required: true },
    middlename: { type: String },
    surname: { type: String },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phonenumber: { type: String, required: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Create model with type assertion
/** @type {Model<IUser>} */
const User = mongoose.model("User", userSchema);

module.exports = User;
