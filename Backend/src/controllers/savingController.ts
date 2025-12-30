const Saving = require("../models/Savings");
const Transaction = require("../models/Transaction");

// ------------------------------
// Create a new saving plan
// POST /api/savings
// ------------------------------
const createSaving = async (req: any, res: any) => {
    try {
        const { userId, title, description, targetAmount, startDate, endDate, currentAmount = 0, status = "active" } = req.body;

        const saving = await Saving.create({
            userId,
            title,
            description,
            targetAmount,
            startDate,
            endDate,
            currentAmount,
            status,
        });

        res.status(201).json({ success: true, data: saving });
    } catch (err: any) {
        console.error("createSavingError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ------------------------------
// Deposit to a saving
// POST /api/savings/:id/deposit
// ------------------------------
// const depositToSaving = async (req: any, res: any) => {
//     try {
//         const { userId, amount } = req.body;
//         const saving = await Saving.findById(req.params.id);

//         if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });
//         if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid deposit amount" });

//         // Increase saving amount
//         saving.currentAmount += amount;

//         // Check if goal reached
//         if (saving.targetAmount && saving.currentAmount >= saving.targetAmount) {
//             saving.status = "completed";
//         }

//         await saving.save();

//         // Create transaction: deduct from balance
//         await Transaction.create({
//             userId,
//             type: "expense",
//             category: "Savings",
//             amount,
//             description: `Deposit to saving: ${saving.title}`,
//             date: new Date(),
//             goalId: saving._id,
//         });

//         res.json({ success: true, data: saving });
//     } catch (err: any) {
//         console.error("depositToSavingError:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

// // ------------------------------
// // Withdraw from a saving
// // POST /api/savings/:id/withdraw
// // ------------------------------
// const withdrawFromSaving = async (req: any, res: any) => {
//     try {
//         const { userId, amount } = req.body;
//         const saving = await Saving.findById(req.params.id);

//         if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });
//         if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
//         if (amount > saving.currentAmount) return res.status(400).json({ success: false, message: "Insufficient funds in saving" });

//         // Decrease saving amount
//         saving.currentAmount -= amount;

//         // Reopen completed saving if funds drop below target
//         if (saving.targetAmount && saving.currentAmount < saving.targetAmount && saving.status === "completed") {
//             saving.status = "active";
//         }

//         await saving.save();

//         // Create transaction: add to balance
//         await Transaction.create({
//             userId,
//             type: "income",
//             category: "Savings Withdrawal",
//             amount,
//             description: `Withdraw from saving: ${saving.title}`,
//             date: new Date(),
//             goalId: saving._id,
//         });

//         res.json({ success: true, data: saving });
//     } catch (err: any) {
//         console.error("withdrawFromSavingError:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

const depositToSaving = async (req: any, res: any) => {
    try {
        console.log("Deposit request body:", req.body);

        const {amount } = req.body;
        const userId = req.user.uid; // 🔑 Firebase UID from auth middleware
        const saving = await Saving.findById(req.params.id);
        console.log("Fetched saving:", saving);

        if (!saving) {
            console.error("Saving plan not found");
            return res.status(404).json({ success: false, message: "Saving plan not found" });
        }
        if (!amount || amount <= 0) {
            console.error("Invalid deposit amount:", amount);
            return res.status(400).json({ success: false, message: "Invalid deposit amount" });
        }

        // Increase saving amount
        saving.currentAmount += amount;
        console.log("Updated saving amount:", saving.currentAmount);

        // Check if goal reached
        if (saving.targetAmount && saving.currentAmount >= saving.targetAmount) {
            saving.status = "completed";
            console.log("Saving goal reached. Status set to completed.");
        }

        await saving.save();
        console.log("Saving saved successfully.");

        // Create transaction: deduct from balance
        const transaction = await Transaction.create({
            userId,
            type: "expense",
            category: "Savings Deposit",
            amount,
            description: `Deposit to saving: ${saving.title}`,
            date: new Date(),
            goalId: saving._id,
        });
        console.log("Transaction created:", transaction);

        res.json({ success: true, data: saving });
    } catch (err: any) {
        console.error("depositToSavingError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const withdrawFromSaving = async (req: any, res: any) => {
    try {
        console.log("Withdraw request body:", req.body);

        const { amount } = req.body;
        const userId = req.user.uid; // 🔑 Firebase UID from auth middleware
        const saving = await Saving.findById(req.params.id);
        console.log("Fetched saving:", saving);

        if (!saving) {
            console.error("Saving plan not found");
            return res.status(404).json({ success: false, message: "Saving plan not found" });
        }
        if (!amount || amount <= 0) {
            console.error("Invalid withdrawal amount:", amount);
            return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
        }
        if (amount > saving.currentAmount) {
            console.error("Insufficient funds. Current amount:", saving.currentAmount, "Requested:", amount);
            return res.status(400).json({ success: false, message: "Insufficient funds in saving" });
        }

        // Decrease saving amount
        saving.currentAmount -= amount;
        console.log("Updated saving amount after withdrawal:", saving.currentAmount);

        // Reopen completed saving if funds drop below target
        if (saving.targetAmount && saving.currentAmount < saving.targetAmount && saving.status === "completed") {
            saving.status = "active";
            console.log("Saving reopened (active) as amount dropped below target.");
        }

        await saving.save();
        console.log("Saving saved successfully after withdrawal.");

        // Create transaction: add to balance
        const transaction = await Transaction.create({
            userId,
            type: "income",
            category: "Savings Withdrawal",
            amount,
            description: `Withdraw from saving: ${saving.title}`,
            date: new Date(),
            goalId: saving._id,
        });
        console.log("Transaction created:", transaction);

        res.json({ success: true, data: saving });
    } catch (err: any) {
        console.error("withdrawFromSavingError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ------------------------------
// Delete a saving plan
// DELETE /api/savings/:id
// ------------------------------
const deleteSaving = async (req: any, res: any) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        await saving.deleteOne();

        res.json({ success: true, message: "Saving plan deleted successfully" });
    } catch (err: any) {
        console.error("deleteSavingError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ------------------------------
// Update a saving plan
// PUT /api/savings/:id
// ------------------------------
const updateSaving = async (req: any, res: any) => {
    try {
        const saving = await Saving.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        res.json({ success: true, data: saving });
    } catch (err: any) {
        console.error("updateSavingError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ------------------------------
// Get all savings for a user
// GET /api/savings
// ------------------------------
const getSavings = async (req: any, res: any) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const savings = await Saving.find({ userId });

        res.json({ success: true, data: savings });
    } catch (err: any) {
        console.error("getSavingsError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ------------------------------
// Get a single saving by ID
// GET /api/savings/:id
// ------------------------------
const getSavingById = async (req: any, res: any) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        res.json({ success: true, data: saving });
    } catch (err: any) {
        console.error("getSavingByIdError:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createSaving,
    depositToSaving,
    withdrawFromSaving,
    deleteSaving,
    updateSaving,
    getSavings,
    getSavingById,
};
