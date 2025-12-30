import { create } from "zustand";
import axios from "axios";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";

interface BudgetItem {
    budgetId:string;
    _id?: string;
    title: string;
    description?:string;
    amount: number;
    spentAmount:number;
}

interface Budget {
    _id?: string;
    title: string;
    description?: string;
    targetAmount?: number;
    currentAmount?: number;
    startDate?: string;
    endDate?: string;
    status: "active" | "completed" | "cancelled";
    items?: BudgetItem[];
}

interface BudgetStore {
    budgets: Budget[];
    loading: boolean;
    error: string | null;

    fetchBudgets: () => Promise<void>;
    createBudget: (data: Partial<Budget>) => Promise<void>;
    addBudgetItem: (budgetId: string, item: BudgetItem) => Promise<void>;
    updateBudget: (budgetId: string, data: Partial<Budget>) => Promise<void>;
    updateBudgetItem: (budgetId: string, itemId:string, data: Partial<Budget>) => Promise<void>;
    deleteBudget: (budgetId: string) => Promise<void>;
    deleteBudgetItem: (budgetId: string, itemId: string) => Promise<void>;
}

const API_URL = "http://192.168.0.24:5000";

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

            const res = await fetch(`${API_URL}/api/budget?userId=${currentUser.uid}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to fetch savings");

            set({ budgets: json.data, loading: false });
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

            console.log('budgetdata=', budgetData)
            const res = await fetch(`${API_URL}/api/budget`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...budgetData,
                    userId: currentUser.uid,
                }),
            });
            console.log('budgetres',res)
            const data = await res.json();
            
            
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

            // ✅ Correct endpoint and request body based on controller
            const res = await fetch(`${API_URL}/api/budgetItem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...item, 
                    budgetId,
                }),
            });
            console.log(res)

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add budget item");

            // ✅ Correctly update local state
            const newItem = data.data;

            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId
                    ? {
                        ...b,
                        items: b.items ? [...b.items, newItem] : [newItem],
                    }
                    : b
            );

            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            console.log("addBudgetItem error:", err);
            set({ error: err.message, loading: false });
        }
    },

    updateBudgetItem: async (budgetId:any, itemId:any, updates:any) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/budgetItem/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    budgetId,
                    ...updates, // e.g., title, description, amount, spentAmount
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update budget item");

            const updatedItem = data.data;

            // ✅ Update the local state correctly
            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId
                    ? {
                        ...b,
                        items: b.items?.map((i) =>
                            i._id === itemId ? updatedItem : i
                        ),
                    }
                    : b
            );

            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            console.error("updateBudgetItem error:", err);
            set({ error: err.message, loading: false });
        }
    },

    deleteBudgetItem: async (budgetId: any, itemId: any) => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");

            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/budgetItem/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete budget item");

            // ✅ Remove deleted item from local state
            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId
                    ? {
                        ...b,
                        items: b.items?.filter((i) => i._id !== itemId),
                    }
                    : b
            );

            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            console.error("deleteBudgetItem error:", err);
            set({ error: err.message, loading: false });
        }
    },

    updateBudget: async (budgetId, data) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.put(
                `${API_URL}/api/budget/${budgetId}`,
                data
            );
            const updatedBudgets = get().budgets.map((b) =>
                b._id === budgetId ? res.data : b
            );
            set({ budgets: updatedBudgets, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    deleteBudget: async (budgetId) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`${API_URL}/api/budget/${budgetId}`);
            set({
                budgets: get().budgets.filter((b) => b._id !== budgetId),
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));
