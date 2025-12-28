import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ActionSheet from "./ActionSheet";

interface Budget {
    _id?: string;
    title: string;
    startDate?: string;
    itemCount?: number;
}

interface BudgetCardProps {
    budget: Budget;
    onEdit?: (budget: Budget) => void;
    onDelete?: (id: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
    const router = useRouter();
    const [showSheet, setShowSheet] = useState(false);

    return (
        <>
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/budget/${budget._id}`)}
                onLongPress={() => setShowSheet(true)}
                activeOpacity={0.9}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="folder-outline" size={34} color="#1E3A8A" />
                </View>

                <View style={styles.dataContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{budget.title}</Text>
                        {budget.startDate && (
                            <Text style={styles.date}>
                                {new Date(budget.startDate).toLocaleDateString()}
                            </Text>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.footerLeft}>
                            <Ionicons name="document-text-outline" size={16} color="#047857" />
                            <Text style={styles.itemCount}>
                                {budget.itemCount ?? 0} item{budget.itemCount === 1 ? "" : "s"}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Custom Action Sheet */}
            <ActionSheet
                visible={showSheet}
                title={budget.title}
                onClose={() => setShowSheet(false)}
                onEdit={() => {
                    setShowSheet(false);
                    onEdit?.(budget);
                }}
                onDelete={() => {
                    setShowSheet(false);
                    onDelete?.(budget._id!);
                }}
            />
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#E0F2FE",
        borderRadius: 10,
        padding: 8,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 10,
        backgroundColor: "#BFDBFE",
        alignItems: "center",
        justifyContent: "center",
    },
    dataContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E3A8A",
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: "#6B7280",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    itemCount: {
        fontSize: 13,
        color: "#047857",
        fontWeight: "500",
    },
});

export default BudgetCard;
