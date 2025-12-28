import React, { useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Transaction = () => {
    const { transactions, getTransactions, loading, error } = useTransactionStore();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?._id) {
            getTransactions(); // fetch all transactions
        }
    }, [user?._id]);

    // Show only the latest 5 transactions
    const recentTransactions = transactions.slice(0, 4);

    // Date formatter helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (isToday) return `Today, ${time}`;
        if (isYesterday) return `Yesterday, ${time}`;
        return date.toLocaleDateString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {loading && <Text>Loading...</Text>}
            {error && <Text style={{ color: "red" }}>{error}</Text>}

            <FlatList
                data={recentTransactions}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.transactionRow}>
                        <Ionicons
                            name={item.type === "income" ? "arrow-up-circle" : "arrow-down-circle"}
                            size={22}
                            color={item.type === "income" ? "#2e7d32" : "#c62828"}
                            style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.transTitle}>{item.category || "No category"}</Text>
                            <Text style={styles.transDesc}>{item.description || "No description"}</Text>
                        </View>
                        <View>
                            <Text
                                style={[
                                    styles.transAmount,
                                    { color: item.type === "income" ? "#2e7d32" : "#c62828" },
                                ]}
                            >
                                KES {Number(item.amount).toLocaleString()}
                            </Text>
                            <Text style={styles.transDate}>{formatDate(item.date)}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

export default Transaction;

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0e0057",
    },
    seeAll: {
        fontSize: 14,
        fontWeight: "500",
        color: "#e68a13",
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        borderRadius:8,
        margin:3,
        padding:12
    },
    transTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    transDesc: {
        fontSize: 12,
        fontWeight: "400",
        color: "#888",
    },
    transDate: {
        fontSize: 12,
        color: "#888",
    },
    transAmount: {
        fontSize: 16,
        fontWeight: "600",
    },
});
