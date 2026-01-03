// app/_layout.tsx
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import * as SecureStore from "expo-secure-store";
import { View } from "react-native";
import { API_URL } from "@/security/constants";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isHydrated, restoreUser } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [pinExists, setPinExists] = useState<boolean | null>(null);

  useEffect(() => {
    // 🔹 1. Wake up Render immediately on app launch
    fetch(`${API_URL}health`).catch(() => { });
    restoreUser();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!isHydrated) return;
      try {
        const pin = await SecureStore.getItemAsync("user_pin");
        setPinExists(!!pin);
      } finally {
        setReady(true);
      }
    };
    init();
  }, [isHydrated]);

  useEffect(() => {
    if (ready && pinExists !== null) {
      SplashScreen.hideAsync();

      // 🔹 SECURITY GUARD: If no user, ALWAYS force login
      if (!user) {
        router.replace("/auth/login");
      }
      // User exists but has no PIN set
      else if (pinExists === false) {
        router.replace("/security/createPin");
      }
      // Everything looks good -> Unlock screen
      else {
        router.replace("/security/unlock");
      }
    }
  }, [ready, pinExists, user]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#0e0057" }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth group */}
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />

        {/* Main app (Protected by logic above) */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="security/unlock" />
        <Stack.Screen name="security/createPin" />
      </Stack>
    </View>
  );
}