const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
} = require("../controllers/budgetController");

const router = express.Router();
router.use(authenticate);

router.get("/", getBudgets);
router.get("/:id", getBudgetById);
router.post("/", createBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports= router;
