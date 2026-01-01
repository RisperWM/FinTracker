import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { auth } from "@/services/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    getIdToken,
} from "firebase/auth";

const API_URL = "http://192.168.0.24:5000";

type UserDetails = {
    _id: string;
    firstname: string;
    middlename?: string;
    surname?: string;
    email: string;
    gender: string;
    phonenumber: string;
    firebaseUid: string;
};

type AuthState = {
    user: UserDetails | null;
    loading: boolean;
    error: string | null;
    isHydrated: boolean;
    register: (data: {
        email: string;
        password: string;
        firstname: string;
        middlename?: string;
        surname?: string;
        gender: string;
        phonenumber: string;
    }) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    getUser: () => Promise<void>;
    restoreUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    error: null,
    isHydrated: false,

    // 🔄 Restore from AsyncStorage
    restoreUser: async () => {
        try {
            set({ loading: true });
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                set({ user: JSON.parse(storedUser), loading: false, isHydrated: true });
            } else {
                set({ user: null, loading: false, isHydrated: true });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false, isHydrated: true });
        }
    },

    // 👤 Fetch user from backend
    getUser: async () => {
        set({ loading: true, error: null });
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("No authenticated user found");

            const token = await getIdToken(currentUser);

            const res = await fetch(`${API_URL}/api/users/getUser`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            let json;
            try {
                json = await res.json();
            } catch (parseError) {
                const errorText = await res.text();
                throw new Error(`Server Error (${res.status}): ${errorText.substring(0, 100)}...`);
            }

            if (!res.ok) throw new Error(json.message || "Failed to fetch user");

            set({ user: json, loading: false, isHydrated: true });
            await AsyncStorage.setItem("user", JSON.stringify(json));
        } catch (err: any) {
            console.error("Auth getUser Error:", err.message);
            set({ error: err.message, loading: false, isHydrated: true });
        }
    },

    // 📝 Register user
    register: async (data) => {
        set({ loading: true, error: null });
        try {
            const firebaseRes = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const token = await getIdToken(firebaseRes.user);

            const res = await fetch(`${API_URL}/api/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstname: data.firstname,
                    middlename: data.middlename,
                    surname: data.surname,
                    gender: data.gender,
                    phonenumber: data.phonenumber,
                    email: data.email,
                    firebaseUid: firebaseRes.user.uid,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Registration failed");

            await useAuthStore.getState().getUser();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    // 🔑 Login user
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const firebaseRes = await signInWithEmailAndPassword(auth, email, password);
            const token = await getIdToken(firebaseRes.user);

            const res = await fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Login failed");

            await useAuthStore.getState().getUser();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    // 🚪 Logout
    logout: async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem("user");
            set({ user: null, isHydrated: true });
            router.push("/auth/login");
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
