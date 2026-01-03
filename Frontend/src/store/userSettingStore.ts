import { create } from "zustand";
import { getIdToken } from "firebase/auth";
import { auth } from "@/services/firebase";
import { API_URL } from "../security/constants";


interface UserSettings {
    autoDeductBudgetExpenses: boolean;
}

interface UserSettingsState {
    settings: UserSettings | null;
    loading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}


export const useUserSettingsStore = create<UserSettingsState>((set) => ({
    settings: null,
    loading: false,
    error: null,

    // 🟢 Fetch user settings from backend
    fetchSettings: async () => {
        set({ loading: true, error: null });

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/settings`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch settings");

            set({ settings: json.data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    // ✏️ Update user settings (toggle deduction preference)
    updateSettings: async (newSettings) => {
        set({ loading: true, error: null });

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newSettings),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to update settings");

            set({ settings: json.data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));