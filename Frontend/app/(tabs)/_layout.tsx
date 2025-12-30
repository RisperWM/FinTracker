import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { usePinStore } from "@/store/pinStore";
import { useEffect, useState } from "react";
import { PIN_KEY } from "@/security/pin";

export default function ProtectedTabsLayout() {
    const { isUnlocked } = usePinStore();
    const [pinExists, setPinExists] = useState<boolean | null>(null);

    // Check if PIN exists
    useEffect(() => {
        const checkPin = async () => {
            const pin = await SecureStore.getItemAsync(PIN_KEY);
            setPinExists(!!pin);
        };
        checkPin();
    }, []);

    // Handle navigation
    useEffect(() => {
        if (pinExists === null) return; // still loading

        if (!pinExists) {
            router.replace("/security/createPin");
        } else if (!isUnlocked) {
            router.replace("/security/unlock");
        }
    }, [pinExists, isUnlocked]);

    // Don't render tabs until PIN exists and is unlocked
    if (pinExists === null || !pinExists || !isUnlocked) return null;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#e68a13",
                tabBarInactiveTintColor: "#eeebebff",
                tabBarStyle: {
                    backgroundColor: "#150040",
                    borderTopWidth: 0.5,
                    borderTopColor: "#ddd",
                    height: 65,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions/index"
                options={{
                    title: "Transactions",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "swap-horizontal" : "swap-horizontal-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="budget/index"
                options={{
                    title: "Budget",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "card" : "card-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            {/* Center Floating Action Button */}
            <Tabs.Screen
                name="quick/index"
                options={{
                    title: "",
                    tabBarIcon: () => null,
                    tabBarButton: () => (
                        <TouchableOpacity
                            style={styles.centerButton}
                            onPress={() => router.push("/quick")}
                        >
                            <View style={styles.centerIcon}>
                                <Ionicons name="add" size={30} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics/index"
                options={{
                    title: "Analytics",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "pie-chart" : "pie-chart-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings/index"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "settings" : "settings-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="savings/index"
                options={{
                    title: "Savings",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "wallet" : "wallet-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerButton: {
        top: -20,
        justifyContent: "center",
        alignItems: "center",
    },
    centerIcon: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: "#e68a13",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
});
