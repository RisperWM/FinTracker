import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import * as Progress from "react-native-progress";

const { width } = Dimensions.get("window");
// Responsive card width calculation
const cardWidth = width > 768 ? width / 3 -30 : width / 2 - 28;

const SavingCard = ({ item, onAction }: any) => {
    const current = item.currentAmount || 0;
    const target = item.targetAmount || 1;
    const progress = Math.min(current / target, 1);
    const isCompleted = progress >= 1;

    // Handle status color based on completion
    const statusColor = isCompleted ? "#2e7d32" : "#0e0057";
    const statusBg = isCompleted ? "#e8f5e9" : "#e8eaf6";

    return (
        <View style={styles.card}>
            {/* Top Row: Status Badge & Percentage */}
            <View style={styles.topRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {item.status?.toUpperCase() || (isCompleted ? "COMPLETED" : "ACTIVE")}
                    </Text>
                </View>
                <Text style={[styles.percentage, { color: isCompleted ? "#2e7d32" : "#f59e0b" }]}>
                    {Math.round(progress * 100)}%
                </Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

            {/* Progress Section */}
            <View style={styles.progressContainer}>
                <Progress.Bar
                    progress={progress}
                    width={cardWidth - 36}
                    height={6}
                    color={isCompleted ? "#2e7d32" : "#f59e0b"}
                    unfilledColor="#f1f5f9"
                    borderWidth={0}
                    borderRadius={10}
                />
            </View>

            {/* Amount Info */}
            <View style={styles.amountInfo}>
                <Text style={styles.currentAmount}>KES {current.toLocaleString()}</Text>
                <Text style={styles.targetAmount}>Goal: {target.toLocaleString()}</Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.btnRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.depositBtn]}
                    onPress={() => onAction(item._id, "deposit")}
                >
                    <Text style={styles.depositText}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.withdrawBtn]}
                    onPress={() => onAction(item._id, "withdraw")}
                >
                    <Text style={styles.withdrawText}>Withdraw</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
        width: cardWidth,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: "600",
        letterSpacing: 0.5
    },
    percentage: {
        fontSize: 12,
        fontWeight: "800"
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0e0057",
        marginBottom: 10
    },
    progressContainer: {
        marginBottom: 10
    },
    amountInfo: {
        marginBottom: 12
    },
    currentAmount: {
        fontSize: 12,
        fontWeight: "900",
        color: "#0e0057"
    },
    targetAmount: {
        fontSize: 10,
        color: "#94a3b8",
        marginTop: 2
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    depositBtn: {
        backgroundColor: "#2e7d32",
    },
    withdrawBtn: {
        backgroundColor: "#f59e0b",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    depositText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700"
    },
    withdrawText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700"
    }
});

export default SavingCard;