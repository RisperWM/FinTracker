import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet, Platform, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as SecureStore from "expo-secure-store";
import { usePinStore } from "@/store/pinStore";
import { useEffect, useState } from "react";
import { PIN_KEY } from "@/security/pin";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 🔹 Custom Background Component for the "Hill" Effect
const TabBg = ({ color = "#0e0057" }) => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={SCREEN_WIDTH} height={Platform.OS === 'ios' ? 95 : 75} viewBox={`0 0 ${SCREEN_WIDTH} 75`}>
                <Path
                    fill={color}
                    d={`M0,0 L${SCREEN_WIDTH * 0.35},0 
             C${SCREEN_WIDTH * 0.42},0 ${SCREEN_WIDTH * 0.40},35 ${SCREEN_WIDTH * 0.5},35 
             C${SCREEN_WIDTH * 0.60},35 ${SCREEN_WIDTH * 0.58},0 ${SCREEN_WIDTH * 0.65},0 
             L${SCREEN_WIDTH},0 L${SCREEN_WIDTH},75 L0,75 Z`}
                />
            </Svg>
        </View>
    );
};

export default function ProtectedTabsLayout() {
    const { isUnlocked } = usePinStore();
    const [pinExists, setPinExists] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPin = async () => {
            const pin = await SecureStore.getItemAsync(PIN_KEY);
            setPinExists(!!pin);
        };
        checkPin();
    }, []);

    useEffect(() => {
        if (pinExists === null) return;
        if (!pinExists) {
            router.replace("/security/createPin");
        } else if (!isUnlocked) {
            router.replace("/security/unlock");
        }
    }, [pinExists, isUnlocked]);

    if (pinExists === null || !pinExists || !isUnlocked) return null;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#f59e0b",
                tabBarInactiveTintColor: "#94a3b8",
                tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
                // 🔹 Use the custom background component
                tabBarBackground: () => <TabBg />,
                tabBarStyle: {
                    backgroundColor: "transparent", // Must be transparent to see the SVG hill
                    borderTopWidth: 0,
                    position: "absolute",
                    elevation: 0,
                    height: Platform.OS === "ios" ? 90 : 70,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="transactions/index"
                options={{
                    title: "Activity",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "swap-horizontal" : "swap-horizontal-outline"} size={22} color={color} />
                    ),
                }}
            />

            {/* 🔹 CENTER BUTTON (FAB) */}
            <Tabs.Screen
                name="quick/index"
                options={{
                    title: "",
                    tabBarButton: () => (
                        <TouchableOpacity
                            style={styles.centerButton}
                            onPress={() => router.push("/quick")}
                            activeOpacity={0.9}
                        >
                            <View style={styles.centerIcon}>
                                <Ionicons name="add" size={32} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tabs.Screen
                name="budget/index"
                options={{
                    title: "Budgets",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "folder" : "folder-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="savings/index"
                options={{
                    title: "Savings",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen name="budget/[id]" options={{ href: null }} />
            <Tabs.Screen name="analytics/index" options={{ href: null }} />
            <Tabs.Screen name="settings/index" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerButton: {
        top: -18,
        justifyContent: "center",
        alignItems: "center",
        width: SCREEN_WIDTH / 5, // Responsive width
    },
    centerIcon: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#f59e0b",
        justifyContent: "center",
        alignItems: "center",
        // Premium Shadow
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 6,
        borderColor: "#f4fafb",
    },
});