// src/components/TransactionCard.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TransactionCardProps {
    item: any;
    onPress: () => void;
    onLongPress: () => void;
    isSelected: boolean;
    selectionMode: boolean;
    style?: ViewStyle;
}

const TransactionCard = ({ item, onPress, onLongPress, isSelected, selectionMode, style }: TransactionCardProps) => {
    const isIncome = item.type === "income";
    const isTransfer = item.type === "transfer";
    const isExpense = item.type === "expense";

    // 🔹 Logic: Determine if a transfer is increasing or decreasing the liquid balance
    // In our system, "back to balance" means money is returning to the wallet (+)
    const isPositiveTransfer = isTransfer && item.description?.toLowerCase().includes("back to");

    // 🔹 Select Theme Colors & Icons
    const getTheme = () => {
        if (isIncome) return { color: "#2e7d32", bg: "#e8f5e9", icon: "arrow-up" };
        if (isTransfer) return { color: "#0284c7", bg: "#e0f2fe", icon: "swap-horizontal" };
        return { color: "#c62828", bg: "#ffebee", icon: "arrow-down" };
    };

    const theme = getTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={[
                styles.card,
                { borderLeftColor: theme.color },
                isSelected && styles.selectedCard,
                style
            ]}
        >
            {selectionMode && (
                <View style={styles.checkbox}>
                    <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={20}
                        color={isSelected ? "#e68a13" : "#ccc"}
                    />
                </View>
            )}

            <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                <Ionicons name={theme.icon as any} size={16} color={theme.color} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{item.category || "General"}</Text>
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
            </View>

            <View style={styles.rightSide}>
                {/* 🔹 Logic: Show + for Income OR Positive Transfers. Show - for Expenses OR Negative Transfers */}
                <Text style={[styles.amount, { color: (isIncome || isPositiveTransfer) ? "#2e7d32" : "#c62828" }]}>
                    {(isIncome || isPositiveTransfer) ? "+" : "-"} {Number(item.amount).toLocaleString()}
                </Text>

                <View style={styles.metaRow}>
                    <Text style={styles.date}>
                        {new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </Text>

                    {item.currentBalance !== undefined && (
                        <Text style={styles.runningBalance}>
                            Bal: {Number(item.currentBalance).toLocaleString()}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default TransactionCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        elevation: 2,
    },
    selectedCard: {
        backgroundColor: "#fffbeb",
        borderColor: "#e68a13",
        borderWidth: 1,
    },
    checkbox: { marginRight: 10 },
    iconContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12 },
    content: { flex: 1 },
    title: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
    description: { fontSize: 12, color: "#71717a", marginTop: 2 },
    rightSide: { alignItems: "flex-end" },
    amount: { fontSize: 15, fontWeight: "700" },
    metaRow: {
        marginTop: 4,
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    date: { fontSize: 10, color: "#a1a1aa" },
    runningBalance: {
        fontSize: 9,
        color: "#94a3b8",
        fontWeight: "500",
        marginTop: 2
    },
});