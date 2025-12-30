import * as SecureStore from "expo-secure-store";

const ATTEMPTS_KEY = "pin_attempts";
const LOCKOUT_KEY = "lockout_until";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export async function handleFailedAttempt() {
    let attempts = parseInt((await SecureStore.getItemAsync(ATTEMPTS_KEY)) || "0");
    attempts += 1;
    await SecureStore.setItemAsync(ATTEMPTS_KEY, attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        await SecureStore.setItemAsync(LOCKOUT_KEY, lockoutUntil.toString());
    }
}

export async function resetAttempts() {
    await SecureStore.deleteItemAsync(ATTEMPTS_KEY);
    await SecureStore.deleteItemAsync(LOCKOUT_KEY);
}

export async function isLockedOut() {
    const lockoutUntil = parseInt((await SecureStore.getItemAsync(LOCKOUT_KEY)) || "0");
    if (lockoutUntil && Date.now() < lockoutUntil) return true;
    if (lockoutUntil && Date.now() >= lockoutUntil) {
        await resetAttempts();
        return false;
    }
    return false;
}
