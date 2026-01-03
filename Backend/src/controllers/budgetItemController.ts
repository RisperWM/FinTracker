const BudgetItem = require("../models/BudgetItem");
const Transaction = require("../models/Transaction");
const UserSettings = require("../models/UserSettings");

// GET /api/budget-items/:budgetId
const getBudgetItems = async (req:any, res:any) => {
    try {
        const { budgetId } = req.params;
        const items = await BudgetItem.find({ budgetId }).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (error:any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/budget-items
const createBudgetItem = async (req:any, res:any) => {
    try {
        const userId = req.user?.uid;
        const { budgetId, title, description, amount, spentAmount } = req.body;

        const item = new BudgetItem({
            budgetId,
            title,
            description,
            amount,
            spentAmount: spentAmount || 0,
        });
        await item.save();

        const userSettings = await UserSettings.findOne({ userId });
        const shouldAutoDeduct = userSettings?.autoDeductBudgetExpenses ?? true;

        // ✅ Initial deduction if created with a spentAmount
        if (shouldAutoDeduct && spentAmount > 0) {
            await Transaction.create({
                userId,
                title,
                amount: spentAmount,
                type: "expense",
                category: "Budget",
                date: new Date(),
                description: `Budget Allocation: ${title}`,
                referenceId: item._id,
            });
        }

        res.status(201).json({ success: true, data: item });
    } catch (error:any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/budget-items/:id
const updateBudgetItem = async (req:any, res:any) => {
    try {
        const userId = req.user?.uid;
        const { id } = req.params;
        const updates = req.body;

        // 1. Find the item before updating to see the previous spentAmount
        const oldItem = await BudgetItem.findById(id);
        if (!oldItem) return res.status(404).json({ success: false, message: "Item not found" });

        // 2. Perform the update
        const updatedItem = await BudgetItem.findByIdAndUpdate(id, updates, { new: true });

        // 3. Handle Transaction Offset Logic
        const userSettings = await UserSettings.findOne({ userId });
        const shouldAutoDeduct = userSettings?.autoDeductBudgetExpenses ?? true;

        if (shouldAutoDeduct && updates.spentAmount !== undefined) {
            const oldSpent = oldItem.spentAmount || 0;
            const newSpent = updatedItem.spentAmount || 0;
            const difference = newSpent - oldSpent;

            if (difference !== 0) {
                // If difference is positive: user spent more (Expense)
                // If difference is negative: user corrected a mistake (Income/Adjustment)
                await Transaction.create({
                    userId,
                    title: `Budget: ${updatedItem.title}`,
                    amount: Math.abs(difference),
                    type: difference > 0 ? "expense" : "income",
                    category: `${updatedItem.title}`,
                    date: new Date(),
                    description: difference > 0
                        ? `Budget: Spent on ${updatedItem.title}`
                        : `Budget (reversing): ${updatedItem.title}`,
                    referenceId: updatedItem._id,
                });
            }
        }

        res.json({ success: true, data: updatedItem });
    } catch (error:any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/budget-items/:id
const deleteBudgetItem = async (req:any, res:any) => {
    try {
        const userId = req.user?.uid;
        const { id } = req.params;

        const itemToDelete = await BudgetItem.findById(id);
        if (!itemToDelete) return res.status(404).json({ success: false, message: "Item not found" });

        // ✅ Offset logic: If money was spent, "return" it to the balance upon deletion
        const userSettings = await UserSettings.findOne({ userId });
        const shouldAutoDeduct = userSettings?.autoDeductBudgetExpenses ?? true;

        if (shouldAutoDeduct && itemToDelete.spentAmount > 0) {
            await Transaction.create({
                userId,
                title: `Deleted Item Refund: ${itemToDelete.title}`,
                amount: itemToDelete.spentAmount,
                type: "income",
                category: "Budget",
                date: new Date(),
                description: `Balance restored from deleted budget item: ${itemToDelete.title}`,
                referenceId: id,
            });
        }

        await BudgetItem.findByIdAndDelete(id);

        res.json({ success: true, message: "Item deleted and balance adjusted" });
    } catch (error:any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getBudgetItems,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem
};