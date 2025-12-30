import { Stack, Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { usePinStore } from "@/store/pinStore";
import { useEffect, useState } from "react";
import { PIN_KEY } from "@/security/pin";

export default function ProtectedLayout() {
    const { isUnlocked } = usePinStore();
    const [pinExists, setPinExists] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPin = async () => {
            const pin = await SecureStore.getItemAsync(PIN_KEY);
            setPinExists(!!pin);
        };
        checkPin();
    }, []);

    if (pinExists === null) return null;

    if (pinExists && !isUnlocked) {
        return <Redirect href="/security/unlock" />; // go to unlock screen
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
