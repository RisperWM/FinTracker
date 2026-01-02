const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// @desc    Create a new habit
const createHabit = async (req: any, res: any) => {
    try {
        const userId = req.user?.uid;

        const habit = await Habit.create({ ...req.body, user: req.user.id });
        console.log('habit created =', habit)
        res.status(201).json(habit);
    } catch (error: any) {
        console.log('create habit error=',error)
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all active habits for user
const getHabits = async (req: any, res: any) => {
    try {
        const habits = await Habit.find({ user: req.user.id, isActive: true });
        console.log('habit fetch=', habits)
        res.json(habits);
    } catch (error: any) {
        console.log('fetch habits error=', error)
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update habit details
const updateHabit = async (req: any, res: any) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!habit) return res.status(404).json({ message: "Habit not found" });
        res.json(habit);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete habit and all its logs
const deleteHabit = async (req: any, res: any) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
        if (!habit) return res.status(404).json({ message: "Habit not found" });

        await HabitLog.deleteMany({ habit: req.params.id });
        await habit.deleteOne();

        res.json({ message: "Habit and logs deleted" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Log progress for a specific day
const logProgress = async (req: any, res: any) => {
    const { habitId, date, status, comment } = req.body;
    try {
        const log = await HabitLog.findOneAndUpdate(
            { habit: habitId, date, user: req.user.id },
            { status, comment },
            { upsert: true, new: true }
        );
        res.json(log);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get habit details with logs and stats
const getHabitDetails = async (req: any, res: any) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
        if (!habit) return res.status(404).json({ message: "Habit not found" });

        const logs = await HabitLog.find({ habit: req.params.id }).sort({ date: -1 });

        // Simple Streak Logic
        let streak = 0;
        for (const log of logs) {
            if (log.status === 'Completed') streak++;
            else break;
        }

        res.json({ habit, logs, stats: { streak, totalLogs: logs.length } });
    } catch (error: any) {
        console.log('get habit details error=', error)
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createHabit,
    getHabits,
    getHabitDetails,
    logProgress,
    deleteHabit,
    updateHabit
}