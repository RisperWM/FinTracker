import { create } from 'zustand';
import axios from 'axios';
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";

export type HabitCategory = 'Career' | 'Education' | 'Spiritual' | 'Health & Wellness' | 'Financial' | 'Social' | 'Other';
export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly';
export type LogStatus = 'Completed' | 'Skipped' | 'Failed';

const API_URL = "http://192.168.0.24:5000";

export interface Habit {
    _id: string;
    title: string;
    description?: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    startDate: string;
    endDate?: string;
    color: string;
    icon: string;
    reminderTime?: string;
    isActive: boolean;
}

export interface HabitLog {
    _id?: string;
    habitId: string;
    date: string; // YYYY-MM-DD
    status: LogStatus;
    comment?: string;
}

interface HabitState {
    habits: Habit[];
    logs: Record<string, HabitLog[]>;
    loading: boolean;
    error: string | null;
    fetchHabits: () => Promise<void>;
    addHabit: (habitData: Partial<Habit>) => Promise<void>;
    updateHabit: (id: string, habitData: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    fetchLogs: (habitId: string) => Promise<void>;
    saveLog: (logData: HabitLog) => Promise<void>;
}

const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const token = await getIdToken(user);
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    };
};

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    logs: {},
    loading: false,
    error: null,

    fetchHabits: async () => {
        set({ loading: true, error: null });
        try {
            const config = await getAuthHeaders();
            const userId = auth.currentUser?.uid;
            const res = await axios.get(`${API_URL}/api/habit?userId=${userId}`, config);
            set({ habits: res.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message, loading: false });
        }
    },

    addHabit: async (habitData) => {
        set({ loading: true, error: null });
        try {
            const config = await getAuthHeaders();
            const userId = auth.currentUser?.uid;
            const payload = { ...habitData, userId };
            const res = await axios.post(`${API_URL}/api/habit`,payload, config);
            set((state) => ({
                habits: [res.data, ...state.habits],
                loading: false
            }));
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message;
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },

    updateHabit: async (id, habitData) => {
        try {
            const config = await getAuthHeaders();
            const res = await axios.put(`${API_URL}/api/habit/${id}`, habitData, config);
            set((state) => ({
                habits: state.habits.map((h) => (h._id === id ? res.data : h)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    deleteHabit: async (id) => {
        try {
            const config = await getAuthHeaders();
            await axios.delete(`${API_URL}/api/habit/${id}`, config);
            set((state) => ({
                habits: state.habits.filter((h) => h._id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    fetchLogs: async (habitId) => {
        try {
            const config = await getAuthHeaders();
            const res = await axios.get(`${API_URL}/api/habitLogs/habit/${habitId}`, config);

            const logData = Array.isArray(res.data) ? res.data : (res.data.data || []);

            set((state) => ({
                logs: { ...state.logs, [habitId]: logData },
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    saveLog: async (logData) => {
        try {
            const config = await getAuthHeaders();
            const userId = auth.currentUser?.uid;

            if (!userId) return;

            const payload = { ...logData, userId };
            const res = await axios.post(`${API_URL}/api/habitLogs`, payload, config);

            const savedLog = res.data.data || res.data;

            set((state) => {
                const habitId = logData.habitId;

                const currentEntry = state.logs[habitId];
                const existingLogs = Array.isArray(currentEntry) ? currentEntry : [];

                const normalizedDate = (date: string) => date?.split('T')[0];
                const savedDate = normalizedDate(savedLog.date);

                const isUpdate = existingLogs.some(l => normalizedDate(l.date) === savedDate);

                const updatedLogs = isUpdate
                    ? existingLogs.map(l => normalizedDate(l.date) === savedDate ? savedLog : l)
                    : [savedLog, ...existingLogs];

                return {
                    logs: { ...state.logs, [habitId]: updatedLogs },
                    error: null
                };
            });
        } catch (err: any) {
            console.error("Save Log Error:", err.response?.data || err.message);
            set({ error: err.message });
        }
    }
}));