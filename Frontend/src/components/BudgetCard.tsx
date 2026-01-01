import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ActionSheet from "./ActionSheet";

const { width } = Dimensions.get("window");

interface BudgetCardProps {
    budget: any;
    onEdit?: (budget: any) => void;
    onDelete?: (id: string) => void;
    isSelected?: boolean;
    selectionMode?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
    budget,
    onEdit,
    onDelete,
    isSelected,
    selectionMode,
    onPress,
    onLongPress
}) => {
    const router = useRouter();
    const [showSheet, setShowSheet] = useState(false);

    // Totals Logic
    const totalAllocated = budget.items?.reduce((sum: number, i: any) => sum + i.amount, 0) || 0;
    const totalSpent = budget.items?.reduce((sum: number, i: any) => sum + i.spentAmount, 0) || 0;

    const progress = totalAllocated > 0 ? totalSpent / totalAllocated : 0;
    const isOver = totalSpent > totalAllocated;

    // Brand Color Palette
    const statusColor = isOver ? "#ef4444" : progress > 0.8 ? "#FF9800" : "#4CAF50";
    const lightStatusBg = isOver ? "#fef2f2" : progress > 0.8 ? "#fff7ed" : "#f0fdf4";

    const handleMainPress = () => {
        if (selectionMode && onPress) {
            onPress();
        } else {
            router.push(`/budget/${budget._id}`);
        }
    };

    return (
        <>
            <TouchableOpacity
                onPress={handleMainPress}
                onLongPress={onLongPress || (() => setShowSheet(true))}
                activeOpacity={0.8}
                style={[
                    styles.card,
                    isSelected && styles.selectedCard
                ]}
            >
                {/* Selection Checkbox (Visible only in Selection Mode) */}
                {selectionMode && (
                    <View style={styles.selectionIndicator}>
                        <Ionicons
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={isSelected ? "#4CAF50" : "#cbd5e1"}
                        />
                    </View>
                )}

                {/* 1. Thin Accent Line */}
                <View style={[styles.statusLine, { backgroundColor: isSelected ? "#4CAF50" : statusColor }]} />

                <View style={styles.innerContent}>
                    <View style={styles.topRow}>
                        <View style={styles.mainInfo}>
                            <Text style={styles.title} numberOfLines={1}>{budget.title}</Text>
                            <View style={styles.metaRow}>
                                <Ionicons name="layers-outline" size={13} color="#64748b" />
                                <Text style={styles.metaText}>{budget.items?.length || 0} Categories</Text>
                                <Text style={styles.separator}>•</Text>
                                <Ionicons name="calendar-outline" size={13} color="#FF9800" />
                                <Text style={styles.dateText}>
                                    {budget.date ? new Date(budget.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "Ongoing"}
                                </Text>
                            </View>
                        </View>

                        {/* 2. Amount Highlight with Status Tint */}
                        <View style={[styles.amountBox, { backgroundColor: lightStatusBg }]}>
                            <Text style={[styles.spentAmount, { color: statusColor }]}>
                                {totalSpent.toLocaleString()}
                            </Text>
                            <Text style={styles.totalLabel}>/ {totalAllocated.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* 3. Floating Progress Pill */}
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: statusColor }
                            ]}
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Actions sheet only available when NOT in selection mode */}
            {!selectionMode && (
                <ActionSheet
                    visible={showSheet}
                    title={budget.title}
                    onClose={() => setShowSheet(false)}
                    onEdit={() => { setShowSheet(false); onEdit?.(budget); }}
                    onDelete={() => { setShowSheet(false); onDelete?.(budget._id!); }}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: "#4CAF50",
        backgroundColor: "#f0fdf4",
    },
    selectionIndicator: {
        justifyContent: 'center',
        paddingLeft: 14,
    },
    statusLine: {
        width: 4,
        height: '100%',
    },
    innerContent: {
        flex: 1,
        padding: 8,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    mainInfo: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: width > 400 ? 17 : 15,
        fontWeight: "800",
        color: "#0e0057",
        letterSpacing: -0.4,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    metaText: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "600",
        marginLeft: 4,
    },
    separator: {
        marginHorizontal: 8,
        color: "#cbd5e1",
    },
    dateText: {
        fontSize: 11,
        color: "#64748b",
        marginLeft: 4,
        fontWeight: "500",
    },
    amountBox: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: "flex-end",
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    spentAmount: {
        fontSize: 14,
        fontWeight: "900",
    },
    totalLabel: {
        fontSize: 10,
        color: "#64748b",
        fontWeight: "700",
        marginTop: 1,
    },
    progressTrack: {
        height: 6,
        backgroundColor: "#f1f5f9",
        borderRadius: 10,
        width: "100%",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 10,
    },
});

export default BudgetCard;