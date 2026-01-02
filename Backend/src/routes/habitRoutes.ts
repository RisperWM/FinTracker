const express = require('express');
const router = express.Router();
const {
    createHabit,
    getHabits,
    updateHabit,
    logProgress,
    deleteHabit,
    getHabitDetails
} = require("../controllers/habitController");

const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.route('/')
    .get(getHabits)
    .post(createHabit);

router.route('/:id')
    .get(getHabitDetails)
    .put(updateHabit)
    .delete(deleteHabit);

router.post('/log', logProgress);

module.exports = router;