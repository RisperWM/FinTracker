const Saving = require("../models/Savings");

// POST /api/savings
const createSaving = async (req: any, res: any) => {
    try {
        const { userId, title, description, targetAmount, startDate,endDate, currentAmount, status } = req.body;

        const saving = await Saving.create({
            userId,
            title,
            description,
            targetAmount,
            startDate,
            endDate,
            currentAmount,
            status
        });

        res.status(201).json({ success: true, data: saving });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
        console.log('savingsError= ',err)
    }
};

// POST /api/savings/:id/deposit
const depositToSaving = async (req: any, res: any) => {
    try {
        const { amount } = req.body;
        const saving = await Saving.findById(req.params.id);

        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        saving.currentAmount += amount;

        // if goal reached
        if (saving.targetAmount && saving.currentAmount >= saving.targetAmount) {
            saving.status = "completed";
        }

        await saving.save();

        res.json({ success: true, data: saving });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/savings/:id/withdraw
const withdrawFromSaving = async (req: any, res: any) => {
    try {
        const { amount } = req.body;
        const saving = await Saving.findById(req.params.id);

        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        if (amount > saving.currentAmount) {
            return res.status(400).json({ success: false, message: "Insufficient funds in saving" });
        }

        saving.currentAmount -= amount;

        // if user withdraws from completed saving, reopen it
        if (saving.targetAmount && saving.currentAmount < saving.targetAmount && saving.status === "completed") {
            saving.status = "active";
        }

        await saving.save();

        res.json({ success: true, data: saving });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/savings/:id
const deleteSaving = async (req: any, res: any) => {
    try {
        const saving = await Saving.findById(req.params.id);

        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        await saving.deleteOne();

        res.json({ success: true, message: "Saving plan deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/savings/:id (update)
const updateSaving = async (req: any, res: any) => {
    try {
        const saving = await Saving.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        res.json({ success: true, data: saving });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/savings
const getSavings = async (req: any, res: any) => {
    try {
        const { userId, month, year } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized.." });
        }

        const savings = await Saving.find({ userId });

        res.json({ success: true, data: savings });
    } catch (error: any) {
        console.log("Error in getSavings:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



// GET /api/savings/:id
const getSavingById = async (req: any, res: any) => {
    try {
        const saving = await Saving.findById(req.params.id);

        if (!saving) return res.status(404).json({ success: false, message: "Saving plan not found" });

        res.json({ success: true, data: saving });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
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
