import { create } from "zustand";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";

const API_URL = "http://192.168.0.24:5000";

type Transaction = {
    _id: string;
    userId: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    description?: string;
    date: string;
    goalId?: string;
};

type Dashboard = {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactions: Transaction[];
};

type TransactionState = {
    transactions: Transaction[];
    dashboard: Dashboard | null;
    totalBalance: number; // 🔹 Added for lifetime balance
    loading: boolean;
    error: string | null;
    addTransaction: (data: Omit<Transaction, "_id" | "userId">) => Promise<boolean>;
    updateTransaction: (id: string, data: Partial<Omit<Transaction, "_id" | "userId">>) => Promise<boolean>;
    deleteTransaction: (id: string) => Promise<boolean>;
    getTransactions: (month?: number, year?: number) => Promise<void>;
    getDashboard: (month: number, year: number) => Promise<void>;
    getTotalBalance: () => Promise<void>; // 🔹 New function
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    dashboard: null,
    totalBalance: 0, // 🔹 Initialized
    loading: false,
    error: null,

    // --- GET TOTAL BALANCE (LIFETIME) ---
    getTotalBalance: async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/transaction/balance?userId=${currentUser.uid}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (res.ok) {
                set({ totalBalance: json.balance });
            }
        } catch (err) {
            console.error("Error fetching total balance:", err);
        }
    },

    // --- ADD ---
    addTransaction: async (data) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/transaction/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...data, userId: currentUser.uid }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to add");

            set((state) => ({
                transactions: [json.transaction, ...state.transactions],
                loading: false,
            }));

            // 🔹 Refresh total balance after adding
            get().getTotalBalance();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    // --- UPDATE ---
    updateTransaction: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/transaction/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to update");

            set((state) => ({
                transactions: state.transactions.map((t) => (t._id === id ? json.transaction : t)),
                loading: false,
            }));

            // 🔹 Refresh total balance after update
            get().getTotalBalance();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    // --- DELETE ---
    deleteTransaction: async (id) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/transaction/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to delete");

            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id),
                loading: false,
            }));

            // 🔹 Refresh total balance after delete
            get().getTotalBalance();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    // --- GET LIST ---
    getTransactions: async (month?, year?) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const query = month && year
                ? `?userId=${currentUser.uid}&month=${month}&year=${year}`
                : `?userId=${currentUser.uid}`;

            const res = await fetch(`${API_URL}/api/transaction/${query}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch");

            set({ transactions: json.transactions, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    // --- GET DASHBOARD ---
    getDashboard: async (month, year) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(
                `${API_URL}/api/transaction/dashboard?userId=${currentUser.uid}&month=${month}&year=${year}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch dashboard");

            set({ dashboard: json, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));