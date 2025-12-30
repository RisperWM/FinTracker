// src/store/savingsStore.ts
import { create } from "zustand";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";

export interface Saving {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    startDate:Date,
    endDate?:Date,
    durationMonths?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface SavingsState {
    savings: Saving[];
    loading: boolean;
    error: string | null;

    fetchSavings: () => Promise<void>;
    getSavingById: (id: string) => Saving | undefined;
    createSaving: (savingData: Partial<Saving>) => Promise<void>;
    updateSaving: (id: string, savingData: Partial<Saving>) => Promise<void>;
    deleteSaving: (id: string) => Promise<void>;
    depositToSaving: (id: string, amount: number) => Promise<void>;
    withdrawFromSaving: (id: string, amount: number) => Promise<void>;
}

const API_URL = "http://192.168.0.24:5000/api/savings";

// Helper to always get auth headers
const getAuthHeaders = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const token = await getIdToken(currentUser);
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const useSavingsStore = create<SavingsState>((set, get) => ({
    savings: [],
    loading: false,
    error: null,

    fetchSavings: async () => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}?userId=${currentUser.uid}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch savings");

            set({ savings: json.data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },


    getSavingById: (id) => get().savings.find((s) => s._id === id),

    createSaving: async (savingData) => {
        try {
            set({ loading: true, error: null });
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);
            const res = await fetch(`${API_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...savingData,
                    userId: currentUser.uid,
                }),
            });

            const data = await res.json();
            set((state) => ({
                savings: [...state.savings, data.data],
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    updateSaving: async (id, savingData) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);

            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({...savingData, userId: currentUser.uid,}),
            });
            const data = await res.json();
            set((state) => ({
                savings: state.savings.map((s) => (s._id === id ? data.data : s)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    deleteSaving: async (id) => {
        try {
            const headers = await getAuthHeaders();
            await fetch(`${API_URL}/${id}`, { method: "DELETE", headers });
            set((state) => ({
                savings: state.savings.filter((s) => s._id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    depositToSaving: async (id, amount) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/${id}/deposit`, {
                method: "POST",
                headers,
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            set((state) => ({
                savings: state.savings.map((s) => (s._id === id ? data.data : s)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    withdrawFromSaving: async (id, amount) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/${id}/withdraw`, {
                method: "POST",
                headers,
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            set((state) => ({
                savings: state.savings.map((s) => (s._id === id ? data.data : s)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
