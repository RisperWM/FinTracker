import * as SecureStore from "expo-secure-store";

export const PIN_KEY = "user_pin";

// Save PIN
export async function setPin(pin: string) {
    await SecureStore.setItemAsync(PIN_KEY, pin, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
}

// Verify PIN
export async function verifyPin(pin: string) {
    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
    return storedPin === pin;
}

// Remove PIN (for reset)
export async function resetPin() {
    await SecureStore.deleteItemAsync(PIN_KEY);
}

// Check if PIN exists
export async function pinExists() {
    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
    return !!storedPin; // true if PIN exists, false otherwise
}
