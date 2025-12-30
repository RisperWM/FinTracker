import { Stack, Slot, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();
const PIN_KEY = "user_pin";

export default function RootLayout() {
  const { user, isHydrated, restoreUser } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [pinExists, setPinExists] = useState<boolean | null>(null);

  useEffect(() => {
    restoreUser();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!isHydrated) return;

      const pin = await SecureStore.getItemAsync(PIN_KEY);
      setPinExists(!!pin);

      await SplashScreen.hideAsync();
      setReady(true);
    };

    init();
  }, [isHydrated]);

  // 🔹 Redirect logic in useEffect to prevent render loops
  useEffect(() => {
    if (!ready || pinExists === null) return;

    if (!user) return;

    if (user && !pinExists) {
      router.replace("/security/createPin");
    }
  }, [ready, pinExists, user]);

  if (!ready || pinExists === null) return null;

  // ❌ Not logged in → show auth stack
  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
        </Stack>
      </QueryClientProvider>
    );
  }

  // ✅ Logged in → allow protected slots
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
