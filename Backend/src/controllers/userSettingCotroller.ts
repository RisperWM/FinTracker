const express = require("express");
const UserSettings = require("../models/UserSettings");

// GET /api/user-settings
 const getUserSettings = async (req: any, res: any) => {
    try {
        const userId = req.user?.uid;
        let settings = await UserSettings.findOne({ userId });

        if (!settings) {
            // If none exists, create defaults
            settings = await UserSettings.create({ userId });
        }

        res.json({ success: true, data: settings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/user-settings
 const updateUserSettings = async (req: any, res: any) => {
    try {
        const userId = req.user?.uid;
        const updates = req.body;

        const settings = await UserSettings.findOneAndUpdate({ userId }, updates, {
            new: true,
            upsert: true,
        });

        res.json({ success: true, data: settings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports ={
    getUserSettings,
    updateUserSettings
}
