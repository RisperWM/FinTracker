import { create } from "zustand";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";
import { API_URL } from "../security/constants";


export interface BudgetItem {
    _id?: string;
    budgetId?: string;
    title: string;
    description?: string;
    amount: number;
    spentAmount: number;
}

export interface Budget {
    _id?: string;
    title: string;
    description?: string;
    targetAmount?: number;
    actualAmount?: number;
    date?: string;
    status?: "active" | "completed" | "cancelled";
    items?: BudgetItem[];
}

interface BudgetStore {
    budgets: Budget[];
    loading: boolean;
    error: string | null;

    fetchBudgets: () => Promise<void>;
    fetchBudgetItems: (budgetId:string) => Promise<void>;
    createBudget: (data: Partial<Budget>) => Promise<void>;
    updateBudget: (budgetId: string, data: Partial<Budget>) => Promise<void>;
    deleteBudget: (budgetId: string) => Promise<void>;
    addBudgetItem: (budgetId: string, item: BudgetItem) => Promise<void>;
    updateBudgetItem: (budgetId: string, itemId: string, data: Partial<BudgetItem>) => Promise<void>;
    deleteBudgetItem: (budgetId: string, itemId: string) => Promise<void>;
}


export const useBudgetStore = create<BudgetStore>((set, get) => ({
    budgets: [],
    loading: false,
    error: null,

    fetchBudgets: async () => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budget?userId=${currentUser.uid}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch");
            set({ budgets: json.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    createBudget: async (budgetData) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budget`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...budgetData, userId: currentUser.uid }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to create");

            set((state) => ({
                budgets: [...state.budgets, data.data],
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    addBudgetItem: async (budgetId, item) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budgetItem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...item, budgetId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add item");

            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId
                    ? { ...b, items: b.items ? [...b.items, data.data] : [data.data] }
                    : b
            );

            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    updateBudgetItem: async (budgetId, itemId, updates) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budgetItem/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ budgetId, ...updates }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update item");

            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId
                    ? {
                        ...b,
                        items: b.items?.map((i) => (i._id === itemId ? data.data : i)),
                    }
                    : b
            );

            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    deleteBudgetItem: async (budgetId, itemId) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budgetItem/${itemId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete item");

            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId
                    ? { ...b, items: b.items?.filter((i) => i._id !== itemId) }
                    : b
            );

            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    updateBudget: async (budgetId, data) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budget/${budgetId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            const json = await res.json();

            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId ? json.data : b
            );
            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    deleteBudget: async (budgetId) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await getIdToken(currentUser);

            await fetch(`${API_URL}api/budget/${budgetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            set({
                budgets: get().budgets.filter((b) => b._id !== budgetId),
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchBudgetItems: async (budgetId:string) => {
        set({ loading: true });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}api/budgetItem/${budgetId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            set((state) => ({
                budgets: state.budgets.map((b) =>
                    b._id === budgetId ? { ...b, items: json.data } : b
                ),
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));