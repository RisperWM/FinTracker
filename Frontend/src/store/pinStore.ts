import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/security/constants";

type PinState = {
    hasPin: boolean;      // true if a PIN exists
    isUnlocked: boolean;  // true if user has passed PIN entry
    checkPinExists: () => Promise<void>; // checks SecureStore for PIN
    unlock: () => void;   // set isUnlocked = true
    lock: () => void;     // set isUnlocked = false
};

export const usePinStore = create<PinState>((set) => ({
    hasPin: false,
    isUnlocked: false,

    checkPinExists: async () => {
        const pin = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
        set({ hasPin: !!pin });
    },

    unlock: () => set({ isUnlocked: true }),
    lock: () => set({ isUnlocked: false }),
}));
