const HabitLog = require("../models/HabitLog");

/**
 * @desc    Log progress for a specific day (Create or Update)
 * @route   POST /api/habits/log
 * @access  Private
 */
exports.logProgress = async (req: any, res: any) => {
    try {
        const { habitId, date, status, comment, userId } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is missing from request."
            });
        }

        if (!habitId || !date) {
            return res.status(400).json({
                success: false,
                message: "Habit ID and Date are required."
            });
        }

        const log = await HabitLog.findOneAndUpdate(
            {
                habitId,
                userId,
                date: date
            },
            {
                status,
                comment
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );
        console.log('log data=', log)

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error("Log Progress Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while logging progress."
        });
    }
};
/**
 * @desc    Get all logs for a specific habit folder
 * @route   GET /api/habits/:id/logs
 * @access  Private
 */
exports.getHabitLogs = async (req:any, res:any) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const logs = await HabitLog.find({ habitId: id, userId })
            .sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
        console.log('logs ',logs)
    } catch (error) {
        console.error("Get Logs Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching logs."
        });
    }
};

/**
 * @desc    Update a specific log entry by its Database ID (Optional standalone update)
 * @route   PUT /api/habits/log/:id
 * @access  Private
 */
exports.updateLog = async (req:any, res:any) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const userId = req.user.id;

        const log = await HabitLog.findOneAndUpdate(
            { _id: id, userId },
            { $set: { status, comment } },
            { new: true, runValidators: true }
        );

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Log entry not found or unauthorized."
            });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error("Update Log Error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating log entry."
        });
    }
};

/**
 * @desc    Delete a specific log entry
 * @route   DELETE /api/habits/log/:id
 * @access  Private
 */
exports.deleteLog = async (req:any, res:any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const log = await HabitLog.findOneAndDelete({ _id: id, userId });

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Log entry not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Log entry removed successfully."
        });
    } catch (error) {
        console.error("Delete Log Error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting log."
        });
    }
};