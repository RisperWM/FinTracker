const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected route example
router.post("/logout", authenticate, userController.logout);
router.get("/getUser", authenticate, userController.getCurrentUser);


module.exports = router;
