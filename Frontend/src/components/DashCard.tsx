import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { AddTransactionPopup } from "@/src/components/addTransaction";

// Get screen dimensions for scaling
const { width } = Dimensions.get("window");
const CARD_HEIGHT = width * 0.42;

const DashCard = () => {
    const [showBalance, setShowBalance] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    const user = useAuthStore((state) => state.user);
    const { dashboard, loading, error, getDashboard, transactions } = useTransactionStore();

    // Refresh dashboard whenever user logs in or transactions change
    useEffect(() => {
        if (user?._id) {
            const now = new Date();
            getDashboard(now.getMonth() + 1, now.getFullYear());
        }
    }, [user?._id, transactions]);

    const balance = dashboard?.balance ?? 0;

    return (
        <ImageBackground
            source={require("@/assets/images/card-bg.jpg")}
            style={styles.card}
            imageStyle={styles.imageBg}
        >
            <View style={styles.overlay} />
            <View style={styles.content}>
                {/* Balance Header */}
                <View style={styles.balance}>
                    <Text style={styles.title}>Total Balance</Text>
                    <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                        <Ionicons name={showBalance ? "eye-off" : "eye"} size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Amount */}
                <View style={styles.amount}>
                    <Text style={styles.currency}>Ksh</Text>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : error ? (
                        <Text style={styles.subtitle}>Error</Text>
                    ) : (
                        <Text style={styles.subtitle}>{showBalance ? balance.toLocaleString() : "••••"}</Text>
                    )}
                </View>

                {/* User Row */}
                <View style={styles.userRow}>
                    <Text style={styles.username}>
                        {user ? `${user.firstname} ${user.middlename} ${user.surname}` : "Guest User"}
                    </Text>

                    <TouchableOpacity style={styles.plusCircle} onPress={() => setShowPopup(true)}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>

                    <AddTransactionPopup visible={showPopup} onClose={() => setShowPopup(false)} />
                </View>
            </View>
        </ImageBackground>
    );
};

export default DashCard;

const styles = StyleSheet.create({
    card: {
        height: CARD_HEIGHT,
        borderRadius: 15,
        overflow: "hidden",
        marginHorizontal: 15,
        marginTop: 5,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    imageBg: {
        borderRadius: 16,
        resizeMode: "cover",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "space-between",
    },
    title: {
        fontSize: width * 0.035,
        fontWeight: "600",
        color: "#eee",
    },
    subtitle: {
        fontSize: width * 0.08,
        color: "#fff",
        fontWeight: "700",
    },
    currency: {
        fontSize: width * 0.05,
        color: "#f0f0f0",
        marginRight: 6,
        alignSelf: "flex-end",
    },
    username: {
        fontSize: width * 0.04,
        color: "#ddd",
        fontWeight: "600",
    },
    amount: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    balance: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    plusCircle: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: (width * 0.12) / 2,
        backgroundColor: "#e68a13",
        justifyContent: "center",
        alignItems: "center",
    },
});
