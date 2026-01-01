const BudgetItem = require("../models/BudgetItem");
const Transaction = require("../models/Transaction");
const UserSettings = require("../models/UserSettings")

// GET /api/budget-items/:budgetId
const getBudgetItems = async (req: any, res: any) => {
    try {
        const { budgetId } = req.params;
        const items = await BudgetItem.find({ budgetId }).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/budget-items
const createBudgetItem = async (req: any, res: any) => {
    try {
        const userId = req.user?.uid;
        const { budgetId, title, description, amount, spentAmount } = req.body;

        const item = new BudgetItem({
            budgetId,
            title,
            description,
            amount,
            spentAmount,
        });
        await item.save();
        console.log(item)

        // 🔍 Check user settings
        const userSettings = await UserSettings.findOne({ userId });
        const shouldAutoDeduct = userSettings?.autoDeductBudgetExpenses ?? true;

        // ✅ Automatically create a transaction if enabled
        if (shouldAutoDeduct && spentAmount > 0) {
            await Transaction.create({
                userId,
                title,
                amount: spentAmount,
                type: "expense",
                category: "Budget",
                date: new Date(),
                description: `Auto-deducted from budget: ${title}`,
                referenceId: budgetId,
            });
        }

        res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        console.log(error)
        console.error("createBudgetItem error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/budget-items/:id
const updateBudgetItem = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const item = await BudgetItem.findByIdAndUpdate(id, updates, { new: true });
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        res.json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBudgetItem = async (req: any, res: any) => {
    try {
        const { id } = req.params;

        const deletedItem = await BudgetItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.json({
            success: true,
            message: "Item deleted successfully"
        });
    } catch (error: any) {
        console.log("Delete Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getBudgetItems,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem
}
