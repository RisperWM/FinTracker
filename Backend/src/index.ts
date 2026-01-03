const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes")
const savingsRoutes = require("./routes/savingsRoutes")
const budgetRoutes = require("./routes/budgetRoutes")
const budgetItemRoutes = require("./routes/budgetItemRoutes")
const userSettingsRoutes = require("./routes/userSettingRoutes")
const habitRoutes = require("./routes/habitRoutes")
const habitLogRoutes = require("./routes/habitLogRoutes")
require("dotenv").config();

const app = express();
const cors = require("cors");
app.use(express.json());

app.use(cors({ origin: "*" }));

const MONGO_URI = process.env.MONGO_URI;

// 🔹 Added Health Check Route for Render/Cron-job
app.get("/health", (req: any, res: any) => {
    res.status(200).send("Server is alive and healthy");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/budgetItem", budgetItemRoutes);
app.use("/api/userSettings", userSettingsRoutes);
app.use('/api/habit', habitRoutes);
app.use('/api/habitLogs', habitLogRoutes);

const PORT = process.env.PORT || 5000;

app.use((req: any, res: any, next: any) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});

// Connect to MongoDB Atlas
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        // 🔹 Render specifically needs the server to listen on 0.0.0.0
        app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err: any) => console.error("MongoDB Connection Error:", err));