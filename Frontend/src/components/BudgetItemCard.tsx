import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";

interface BudgetItem {
    _id?: string;
    budgetId: string;
    title: string;
    description?: string;
    amount: number;
    spentAmount: number;
    createdAt?: string;
    updatedAt?: string;
}

interface BudgetItemCardProps {
    item: BudgetItem;
    onEdit: (item: BudgetItem) => void;
    onDelete: (id: string) => void;
    onPress?: () => void;
}

// ✅ Currency formatter
const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return "Ksh 0.00";
    return `Ksh ${amount.toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const BudgetItemCard: React.FC<BudgetItemCardProps> = ({
    item,
    onEdit,
    onDelete,
    onPress,
}) => {
    const [showActions, setShowActions] = useState(false);

    const progress = item.amount ? item.spentAmount / item.amount : 0;
    const percentage = Math.round(progress * 100);
    const overBudget = item.spentAmount > item.amount;
    const extraAmount = overBudget ? item.spentAmount - item.amount : 0;

    // ✅ Color logic
    let statusColor = "#059669"; // green
    if (percentage > 90 && percentage <= 100) statusColor = "#e79332ff"; // orange
    if (percentage > 100) statusColor = "#DC2626"; // red

    const handlePress = () => {
        setShowActions(!showActions);
        onPress?.();
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: pressed ? "#F0FDF4" : "#FFFFFF" },
            ]}
            onPress={handlePress}
        >
            {/* Circular Progress */}
            <View style={styles.progressContainer}>
                <AnimatedCircularProgress
                    size={52}
                    width={6}
                    fill={percentage > 100 ? 100 : percentage}
                    tintColor={statusColor}
                    backgroundColor="#E5E7EB"
                    rotation={0}
                    lineCap="round"
                >
                    {() => (
                        <Ionicons name="wallet-outline" size={20} color={statusColor} />
                    )}
                </AnimatedCircularProgress>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                </Text>
                {item.description && (
                    <Text style={styles.desc} numberOfLines={1}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.amountRow}>
                    <Text style={styles.spent}>{formatCurrency(item.spentAmount)}</Text>
                    <Text style={styles.total}> / {formatCurrency(item.amount)}</Text>
                </View>

                {overBudget ? (
                    <Text style={[styles.overBudgetText, { color: statusColor }]}>
                        Over budget by {formatCurrency(extraAmount)}
                    </Text>
                ) : (
                    <Text style={[styles.percent, { color: statusColor }]}>
                        {percentage}% spent
                    </Text>
                )}
            </View>

            {/* Actions (Edit/Delete) */}
            {showActions && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => onEdit(item)}
                    >
                        <Ionicons name="create-outline" size={20} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, { marginLeft: 8 }]}
                        onPress={() => onDelete(item._id!)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 5,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 2,
        alignItems: "center",
    },
    progressContainer: {
        marginRight: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    desc: {
        color: "#6B7280",
        fontSize: 13,
        marginTop: 2,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    spent: {
        color: "#065F46",
        fontWeight: "600",
    },
    total: {
        color: "#6B7280",
        fontSize: 13,
        marginLeft: 4,
    },
    percent: {
        fontSize: 13,
        fontWeight: "600",
        marginTop: 4,
    },
    overBudgetText: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 4,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    iconButton: {
        padding: 6,
        borderRadius: 8,
    },
});

export default BudgetItemCard;