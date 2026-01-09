import { create } from "zustand";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";

import { API_URL } from "../security/constants";

export type Transaction = {
    _id: string;
    userId: string;
    type: "income" | "expense" | "transfer";
    category: string;
    amount: number;
    description?: string;
    date: string;
    goalId?: string;
    currentBalance?: number;
};

type Dashboard = {
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    balance: number;
    transactions: Transaction[];
};

type TransactionState = {
    transactions: Transaction[];
    dashboard: Dashboard | null;
    totalBalance: number;
    totalLoans: number;  // 🔹 Added
    totalDebts: number;  // 🔹 Added
    loading: boolean;
    error: string | null;
    addTransaction: (data: Omit<Transaction, "_id" | "userId">) => Promise<boolean>;
    updateTransaction: (id: string, data: Partial<Omit<Transaction, "_id" | "userId">>) => Promise<boolean>;
    deleteTransaction: (id: string) => Promise<boolean>;
    getTransactions: (month?: number, year?: number) => Promise<void>;
    getDashboard: (month: number, year: number) => Promise<void>;
    getTotalBalance: () => Promise<void>;
    getLoanAmount: () => Promise<void>; // 🔹 Added
    getDebtAmount: () => Promise<void>; // 🔹 Added
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    dashboard: null,
    totalBalance: 0,
    totalLoans: 0,
    totalDebts: 0,
    loading: false,
    error: null,

    // --- GET TOTAL BALANCE (LIFETIME) ---
    getTotalBalance: async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/transaction/balance?userId=${currentUser.uid}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (res.ok) {
                set({ totalBalance: json.balance });
            }

            // 🔹 Refresh exposure totals whenever balance is checked
            get().getLoanAmount();
            get().getDebtAmount();
        } catch (err) {
            console.error("Error fetching total balance:", err);
        }
    },

    // --- GET LOAN AMOUNT ---
    getLoanAmount: async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/transaction/loans?userId=${currentUser.uid}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (res.ok) set({ totalLoans: json.amount });
        } catch (err) {
            console.error("Error fetching loans:", err);
        }
    },

    // --- GET DEBT AMOUNT ---
    getDebtAmount: async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/transaction/debts?userId=${currentUser.uid}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (res.ok) set({ totalDebts: json.amount });
        } catch (err) {
            console.error("Error fetching debts:", err);
        }
    },

    // --- ADD ---
    addTransaction: async (data) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/transaction/`, {
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
                totalBalance: json.currentBalance,
                loading: false,
            }));

            // Refresh exposure logic
            get().getLoanAmount();
            get().getDebtAmount();

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

            const res = await fetch(`${API_URL}api/transaction/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...data, userId: currentUser.uid }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to update");

            set((state) => ({
                transactions: state.transactions.map((t) => (t._id === id ? json.transaction : t)),
                loading: false,
            }));

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

            const res = await fetch(`${API_URL}api/transaction/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete");

            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id),
                loading: false,
            }));

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

            const queryParams = new URLSearchParams({
                userId: currentUser.uid,
                ...(month && { month: month.toString() }),
                ...(year && { year: year.toString() }),
            });

            const res = await fetch(`${API_URL}api/transaction?${queryParams.toString()}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch");

            set({
                transactions: json.transactions,
                totalBalance: json.globalBalance,
                loading: false
            });

            get().getLoanAmount();
            get().getDebtAmount();
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
                `${API_URL}api/transaction/dashboard?userId=${currentUser.uid}&month=${month}&year=${year}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch dashboard");

            set({ dashboard: json, loading: false });

            get().getLoanAmount();
            get().getDebtAmount();
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));