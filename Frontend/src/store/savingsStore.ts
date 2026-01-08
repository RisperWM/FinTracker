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
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface SavingsState {
    savings: Saving[];
    loading: boolean;
    isWakingUp: boolean;
    error: string | null;

    // Fetchers
    fetchAllGoals: () => Promise<void>;
    fetchSavings: () => Promise<void>;
    fetchLoans: () => Promise<void>;
    fetchDebts: () => Promise<void>;

    // 🔹 Add this line to the interface:
    privateFetch: (url: string) => Promise<void>;

    getSavingById: (id: string) => Saving | undefined;
    createSaving: (savingData: Partial<Saving>) => Promise<boolean>;
    updateSaving: (id: string, savingData: Partial<Saving>) => Promise<void>;
    deleteSaving: (id: string) => Promise<void>;

    depositToSaving: (id: string, amount: number) => Promise<void>;
    withdrawFromSaving: (id: string, amount: number) => Promise<void>;
    clearError: () => void;
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
    isWakingUp: false,
    error: null,

    clearError: () => set({ error: null }),

    // 🔹 Generic Fetcher with Wake-up detection
    privateFetch: async (url: string) => {
        set({ loading: true, error: null, isWakingUp: false });
        const wakeUpTimer = setTimeout(() => set({ isWakingUp: true }), 4000);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(url, { method: "GET", headers });
            const json = await res.json();

            clearTimeout(wakeUpTimer);
            if (!res.ok) throw new Error(json.message || "Failed to fetch data");

            set({ savings: json.data || [], loading: false, isWakingUp: false });
        } catch (err: any) {
            clearTimeout(wakeUpTimer);
            set({ error: err.message, loading: false, isWakingUp: false });
        }
    },

    fetchAllGoals: () => get().privateFetch(`${API_URL}api/savings`),
    fetchSavings: () => get().privateFetch(`${API_URL}api/savings?type=saving`),
    fetchLoans: () => get().privateFetch(`${API_URL}api/savings?type=loan`),
    fetchDebts: () => get().privateFetch(`${API_URL}api/savings?type=debt`),

    getSavingById: (id) => get().savings.find((s) => s._id === id),

    createSaving: async (savingData) => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}api/savings`, {
                method: "POST",
                headers,
                body: JSON.stringify(savingData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Creation failed");

            set((state) => ({
                savings: [data.data, ...state.savings],
                loading: false,
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    // 🔹 Updated Action Endpoints to match /action/:id
    // store/savingsStore.ts (Update these two methods)

    depositToSaving: async (id, amount) => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();

            // 🔹 Fix: Clean the URL joining
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const url = `${baseUrl}/api/savings/deposit/${id}`;

            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({ amount }),
            });

            if (!res.ok) {
        const errorBody = await res.text(); 
        throw new Error(`Server returned ${res.status}`);
    }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Deposit failed");

            set((state) => ({
                savings: state.savings.map((s) => (s._id === id ? data.data : s)),
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    withdrawFromSaving: async (id, amount) => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();

            // 🔹 Fix: Clean the URL joining
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const url = `${baseUrl}/api/savings/withdraw/${id}`;

            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({ amount }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Withdrawal failed");

            set((state) => ({
                savings: state.savings.map((s) => (s._id === id ? data.data : s)),
                loading: false,
            }));
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
}));