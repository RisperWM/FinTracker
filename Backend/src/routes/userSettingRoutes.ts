const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { getUserSettings, updateUserSettings } = require("../controllers/userSettingCotroller");

const router = express.Router();

router.get("/", authenticate, getUserSettings);
router.put("/", authenticate, updateUserSettings);

module.exports = router;
