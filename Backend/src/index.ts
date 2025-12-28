// src/index.ts
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes")
const savingsRoutes = require("./routes/savingsRoutes")
const budgetRoutes = require("./routes/budgetRoutes")
const budgetItemRoutes = require("./routes/budgetItemRoutes")
const userSettingsRoutes = require("./routes/userSettingRoutes")
require("dotenv").config();

const app = express();
const cors = require("cors");
app.use(express.json());

app.use(cors({ origin: "*" })); // for testing

const MONGO_URI = process.env.MONGO_URI;
// Routes
app.use("/api/users", userRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/budgetItem", budgetItemRoutes);
app.use("/api/userSettings", userSettingsRoutes);



const PORT = process.env.PORT || 5000;
app.use((req:any, res:any, next:any) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});

// Connect to MongoDB Atlas
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err:any) => console.log(err));
