import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import TransactionCard from "./TransactionCard";

const Transaction = () => {
    const { transactions, getTransactions, deleteTransaction, loading, error } = useTransactionStore();
    const user = useAuthStore((state) => state.user);

    // State for batch selection
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
            // Normal behavior: maybe go to edit?
            // router.push({ pathname: "/(tabs)/transactions/edit", params: { id: item._id } });
            console.log("Edit item", item._id);
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
                            <Ionicons name="trash-outline" size={20} color="#c62828" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.iconBtn}>
                            <Ionicons name="close-circle-outline" size={22} color="#71717a" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.seeAllContainer}
                        onPress={() => router.push("/(tabs)/transactions")}
                    >
                        <Text style={styles.seeAll}>View All</Text>
                        <Ionicons name="chevron-forward" size={14} color="#e68a13" />
                    </TouchableOpacity>
                )}
            </View>

            {loading && <View style={styles.center}><Text style={styles.statusText}>Syncing...</Text></View>}

            <FlatList
                data={recentTransactions}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <TransactionCard
                        item={item}
                        selectionMode={isSelectionMode}
                        isSelected={selectedIds.includes(item._id)}
                        onPress={() => handlePress(item)}
                        onLongPress={() => toggleSelection(item._id)}
                    />
                )}
                contentContainerStyle={styles.listPadding}
            />
        </View>
    );
};

export default Transaction;

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 4,
        height: 30,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        letterSpacing: -0.5,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 2,
    },
    seeAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAll: {
        fontSize: 13,
        fontWeight: "600",
        color: "#e68a13",
        marginRight: 2,
    },
    listPadding: {
        paddingBottom: 4,
    },
    center: {
        padding: 10,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        color: "#a1a1aa",
    },
});