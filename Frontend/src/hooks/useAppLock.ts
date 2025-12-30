import { AppState } from "react-native";
import { useEffect } from "react";
import { usePinStore } from "@/store/pinStore";

export function useAppLock() {
    const { lock } = usePinStore();

    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state !== "active") {
                lock();
            }
        });

        return () => sub.remove();
    }, []);
}
