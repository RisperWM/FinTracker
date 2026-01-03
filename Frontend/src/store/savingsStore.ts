import { create } from "zustand";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";
import { API_URL } from "../security/constants";


export type GoalType = 'saving' | 'loan' | 'debt';

export interface Saving {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    type: GoalType;
    targetAmount: number;
    currentAmount: number;
    startDate: Date;
    endDate?: Date;
    durationMonths?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface SavingsState {
    savings: Saving[];
    loading: boolean;
    error: string | null;

    // Fetchers
    fetchAllGoals: () => Promise<void>;
    fetchSavings: () => Promise<void>;
    fetchLoans: () => Promise<void>;
    fetchDebts: () => Promise<void>;

    getSavingById: (id: string) => Saving | undefined;
    createSaving: (savingData: Partial<Saving>) => Promise<void>;
    updateSaving: (id: string, savingData: Partial<Saving>) => Promise<void>;
    deleteSaving: (id: string) => Promise<void>;

    depositToSaving: (id: string, amount: number) => Promise<void>;
    withdrawFromSaving: (id: string, amount: number) => Promise<void>;
}


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

    // 🔹 1. Fetch ALL (So loans like "Dad" show up in the main list)
    fetchAllGoals: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            // No type filter = backend returns all types
            const res = await fetch(`${API_URL}api/savings`, { method: "GET", headers });
            const json = await res.json();
            set({ savings: json.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    // 🔹 2. Fetch specific types (for filtered tabs)
    fetchSavings: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}api/savings?type=saving`, { method: "GET", headers });
            const json = await res.json();
            set({ savings: json.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchLoans: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}api/savings/loans`, { method: "GET", headers });
            const json = await res.json();
            set({ savings: json.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchDebts: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}api/savings/debts`, { method: "GET", headers });
            const json = await res.json();
            set({ savings: json.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    getSavingById: (id) => get().savings.find((s) => s._id === id),

    createSaving: async (savingData) => {
        try {
            set({ loading: true, error: null });
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}api/savings`, {
                method: "POST",
                headers,
                body: JSON.stringify(savingData),
            });

            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    savings: [data.data, ...state.savings],
                    loading: false,
                }));
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    updateSaving: async (id, savingData) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}api/savings/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(savingData),
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
            await fetch(`${API_URL}api/savings/${id}`, { method: "DELETE", headers });
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
            const res = await fetch(`${API_URL}api/savings/${id}/deposit`, {
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
            const res = await fetch(`${API_URL}api/savings/${id}/withdraw`, {
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