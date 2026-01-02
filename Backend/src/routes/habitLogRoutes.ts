const express = require('express');
const router = express.Router();

const {
    logProgress,
    getHabitLogs,
    updateLog,
    deleteLog
} = require("../controllers/habitLogController");

const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.post('/', logProgress);
router.get('/habit/:id', getHabitLogs);
router.route('/:id')
    .put(updateLog)
    .delete(deleteLog);

module.exports = router;