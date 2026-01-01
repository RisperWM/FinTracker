import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from "react-native";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import TransactionCard from "./TransactionCard";

// 🔹 Get screen dimensions for responsiveness
const { width } = Dimensions.get("window");

// 🔹 Responsive scaling helper (scales based on a standard 375px width screen)
const scale = (size: number) => (width / 375) * size;

const Transaction = () => {
    const { transactions, getTransactions, deleteTransaction, loading } = useTransactionStore();
    const user = useAuthStore((state) => state.user);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const isSelectionMode = selectedIds.length > 0;

    useEffect(() => {
        if (user?._id) {
            getTransactions();
        }
    }, [user?._id]);

    const recentTransactions = transactions.slice(0, 4);

    const handlePress = (item: any) => {
        if (isSelectionMode) {
            toggleSelection(item._id);
        } else {
            console.error("Edit item", item._id);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBatchDelete = () => {
        Alert.alert(
            "Delete Transactions",
            `Remove ${selectedIds.length} selected items?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        for (const id of selectedIds) {
                            await deleteTransaction(id);
                        }
                        setSelectedIds([]);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.headerTitle}>
                        {isSelectionMode ? `${selectedIds.length} Selected` : "Recent Activity"}
                    </Text>
                </View>

                {isSelectionMode ? (
                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={handleBatchDelete} style={styles.iconBtn}>
                            <Ionicons name="trash-outline" size={scale(20)} color="#c62828" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.iconBtn}>
                            <Ionicons name="close-circle-outline" size={scale(22)} color="#71717a" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.seeAllContainer}
                        onPress={() => router.push("/(tabs)/transactions")}
                    >
                        <Text style={styles.seeAll}>View All</Text>
                        <Ionicons name="chevron-forward" size={scale(14)} color="#e68a13" />
                    </TouchableOpacity>
                )}
            </View>

            {loading && (
                <View style={styles.center}>
                    <Text style={styles.statusText}>Syncing...</Text>
                </View>
            )}

            {/* 🔹 Using map instead of FlatList for better performance inside a Parent ScrollView */}
            <View style={styles.listContainer}>
                {recentTransactions.map((item) => (
                    <TransactionCard
                        key={item._id}
                        item={item}
                        selectionMode={isSelectionMode}
                        isSelected={selectedIds.includes(item._id)}
                        onPress={() => handlePress(item)}
                        onLongPress={() => toggleSelection(item._id)}
                    />
                ))}
            </View>
        </View>
    );
};

export default Transaction;

const styles = StyleSheet.create({
    container: {
        // 🔹 Percentage-based padding for responsiveness
        paddingHorizontal: width * 0.04,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: scale(16),
        paddingHorizontal: scale(4),
        height: scale(23),
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        // 🔹 Scaled font size
        fontSize: scale(18),
        fontWeight: "800",
        color: "#0e0057",
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    iconBtn: {
        padding: scale(2),
    },
    seeAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAll: {
        fontSize: scale(13),
        fontWeight: "600",
        color: "#e68a13",
        marginRight: scale(2),
    },
    listContainer: {
        paddingBottom: scale(10),
    },
    center: {
        padding: scale(10),
        alignItems: 'center',
    },
    statusText: {
        fontSize: scale(13),
        color: "#a1a1aa",
    },
});