const Budget = require("../models/Budget");
const BudgetItem = require("../models/BudgetItem");

// GET /api/budgets
const getBudgets = async (req: any, res: any) => {
    try {
        const userId = req.user?.uid;
        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: budgets });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/budgets/:id
const getBudgetById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findById(id);
        if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });

        const items = await BudgetItem.find({ budgetId: id });
        res.json({ success: true, data: { budget, items } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/budgets
const createBudget = async (req: any, res: any) => {
    try {
        const userId = req.user?.uid;
        const { title, description, targetAmount, startDate, endDate } = req.body;

        const budget = new Budget({
            userId,
            title,
            description,
            targetAmount,
            startDate,
            endDate,
            currentAmount: 0,
        });

        await budget.save();
        res.status(201).json({ success: true, data: budget });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
        console.error(error.message)
    }
};

// PUT /api/budgets/:id
const updateBudget = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const budget = await Budget.findByIdAndUpdate(id, updates, { new: true });

        if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });
        res.json({ success: true, data: budget });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        await Budget.findByIdAndDelete(id);
        await BudgetItem.deleteMany({ budgetId: id }); // cascade delete
        res.json({ success: true, message: "Budget deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget
}