import { Stack, Slot, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";

// Keep the native splash screen visible while initializing
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

      try {
        const pin = await SecureStore.getItemAsync(PIN_KEY);
        setPinExists(!!pin);
      } catch (e) {
        console.warn("Init Error:", e);
      } finally {
        setReady(true);
      }
    };

    init();
  }, [isHydrated]);

  // Handle splash screen dismissal and pin-specific redirection
  useEffect(() => {
    if (ready && pinExists !== null) {
      // 1. Hide splash now that we know auth & pin status
      SplashScreen.hideAsync();

      // 2. ONLY redirect to createPin if they are logged in but have no pin
      // This leaves your existing login/register logic untouched
      if (user && pinExists === false) {
        router.replace("/security/createPin");
      }
    }
  }, [ready, pinExists, user]);

  // Keep native splash visible until logic is determined
  if (!ready || pinExists === null) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrapper matches splash background #0e0057.
          This ensures that when the splash fades, the background matches 
          instead of flashing white.
      */}
      <View style={{ flex: 1, backgroundColor: "#0e0057" }}>
        {!user ? (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
          </Stack>
        ) : (
          <Slot />
        )}
      </View>
    </QueryClientProvider>
  );
}