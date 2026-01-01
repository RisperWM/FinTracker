import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet, Platform, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as SecureStore from "expo-secure-store";
import { usePinStore } from "@/store/pinStore";
import { useEffect, useState } from "react";
import { PIN_KEY } from "@/security/pin";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 🔹 Tightened Background Component
const TabBg = ({ color = "#0e0057" }) => {
    const centerX = SCREEN_WIDTH / 2;
    // 🔹 Reduced curveWidth to make the "hill" tighter
    const curveWidth = 55;
    const curveHeight = 38;

    const d = [
        `M 0 0`,
        `L ${centerX - curveWidth} 0`,
        // The control points are pulled closer to the center for a sharper, crisper curve
        `C ${centerX - curveWidth + 15} 0, ${centerX - 30} ${curveHeight}, ${centerX} ${curveHeight}`,
        `C ${centerX + 30} ${curveHeight}, ${centerX + curveWidth - 15} 0, ${centerX + curveWidth} 0`,
        `L ${SCREEN_WIDTH} 0`,
        `L ${SCREEN_WIDTH} 100`,
        `L 0 100`,
        `Z`
    ].join(" ");

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={SCREEN_WIDTH} height={100} viewBox={`0 0 ${SCREEN_WIDTH} 100`}>
                <Path fill={color} d={d} />
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
                tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginBottom: Platform.OS === 'ios' ? 0 : 5 },
                tabBarBackground: () => <TabBg />,
                tabBarStyle: {
                    backgroundColor: "transparent",
                    borderTopWidth: 0,
                    position: "absolute",
                    elevation: 0,
                    height: Platform.OS === "ios" ? 85 : 65,
                    bottom: 0,
                    left: 0,
                    right: 0,
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
        top: -22,
        justifyContent: "center",
        alignItems: "center",
        width: SCREEN_WIDTH / 5,
    },
    centerIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#f59e0b",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 5,
        borderColor: "#fcfcfc",
    },
});