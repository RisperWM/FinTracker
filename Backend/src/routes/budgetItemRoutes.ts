const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { getBudgetItems, createBudgetItem, updateBudgetItem, deleteBudgetItem, } = require("../controllers/budgetItemController");

const router = express.Router();

router.get("/:budgetId", authenticate, getBudgetItems);
router.post("/", authenticate, createBudgetItem);
router.put("/:id", authenticate, updateBudgetItem);
router.delete("/:id", authenticate, deleteBudgetItem);

module.exports = router;
