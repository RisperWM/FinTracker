import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";

interface Props {
    item: any;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onLogSpent: (item: any) => void;
    isSelected?: boolean;
    selectionMode?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
}

const BudgetItemCard: React.FC<Props> = ({
    item,
    onEdit,
    onDelete,
    onLogSpent,
    isSelected,
    selectionMode,
    onPress,
    onLongPress
}) => {
    const [showActions, setShowActions] = useState(false);
    const progress = item.amount > 0 ? (item.spentAmount / item.amount) * 100 : 0;

    let statusColor = "#4CAF50";
    if (progress > 85) statusColor = "#FF9800";
    if (progress > 100) statusColor = "#EF4444";

    const handlePress = () => {
        if (selectionMode && onPress) {
            onPress();
        } else {
            setShowActions(!showActions);
        }
    };

    return (
        <View style={[
            styles.outerContainer,
            isSelected && styles.selectedCard
        ]}>
            {/* Main Info Section */}
            <View style={styles.topSection}>
                <View style={[styles.statusLine, { backgroundColor: statusColor }]} />

                <Pressable
                    onPress={handlePress}
                    onLongPress={onLongPress}
                    style={styles.card}
                >
                    {selectionMode && (
                        <View style={styles.selectionIcon}>
                            <Ionicons
                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                size={22}
                                color={isSelected ? "#4CAF50" : "#CBD5E1"}
                            />
                        </View>
                    )}

                    <AnimatedCircularProgress
                        size={45}
                        width={5}
                        fill={progress > 100 ? 100 : progress}
                        tintColor={statusColor}
                        backgroundColor="#F1F5F9"
                        rotation={0}
                        lineCap="round"
                    >
                        {() => <Text style={[styles.progressText, { color: statusColor }]}>{Math.round(progress)}%</Text>}
                    </AnimatedCircularProgress>

                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.amountRow}>
                            <Text style={styles.spentText}>KES {item.spentAmount.toLocaleString()}</Text>
                            <Text style={styles.totalText}> of {item.amount.toLocaleString()}</Text>
                        </View>
                    </View>

                    {!selectionMode && (
                        <Ionicons
                            name={showActions ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#CBD5E1"
                        />
                    )}
                </Pressable>
            </View>

            {/* Actions Row - Now positioned below to prevent text squeezing */}
            {showActions && !selectionMode && (
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => onLogSpent(item)} style={styles.actionBtn}>
                        <Ionicons name="add-circle-outline" size={16} color="#4CAF50" />
                        <Text style={[styles.actionText, { color: "#4CAF50" }]}>Log Spend</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
                        <Ionicons name="pencil-outline" size={16} color="#64748B" />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onDelete(item._id!)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedCard: {
        backgroundColor: "#F0FDF4",
        borderColor: "#4CAF50",
        borderWidth: 1,
    },
    statusLine: {
        width: 4,
        height: '100%',
    },
    card: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    selectionIcon: {
        marginRight: 10,
    },
    progressText: { fontSize: 10, fontWeight: "800" },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 2
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    spentText: { fontSize: 14, fontWeight: "700", color: "#0e0057" },
    totalText: { fontSize: 12, color: "#64748B", marginLeft: 4 },
    actionRow: {
        flexDirection: "row",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        justifyContent: 'space-around',
        backgroundColor: "#fafafa"
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#64748B"
    }
});

export default BudgetItemCard;