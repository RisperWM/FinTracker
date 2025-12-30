// src/components/Savings.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useSavingsStore } from "@/store/savingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import CreateSavingModal from "@/src/components/SavingsModal";
import { DepositModal } from "./SavingsDepositModal";

// Section header
const SectionHeader = ({ title, actionLabel, onAction }: any) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onAction}>
            <Text style={styles.link}>{actionLabel}</Text>
        </TouchableOpacity>
    </View>
);

// Saving card
const SavingCard = ({ item, onAction }: any) => {
    if (!item) return null;

    const current = Number(item.currentAmount) || 0;
    const target = Number(item.targetAmount) || 1;
    const progress = Math.min(current / target, 1);

    return (
        <View style={styles.card}>
            {/* Header: title & status */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <View
                    style={[
                        styles.statusContainer,
                        item.status === "completed"
                            ? styles.statusCompleted
                            : styles.statusActive,
                    ]}
                >
                    <Text style={styles.status}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressWrapper}>
                <View style={styles.progressBackground}>
                    <View
                        style={[styles.progressFill, { width: `${progress * 100}%` }]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {`${current.toLocaleString()} / ${target.toLocaleString()}`}
                </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
                    onPress={() => onAction(item._id, "deposit")}
                >
                    <Text style={styles.actionText}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#FF9800" }]}
                    onPress={() => onAction(item._id, "withdraw")}
                >
                    <Text style={styles.actionText}>Withdraw</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Main Savings Component
const Savings = () => {
    const {
        savings,
        fetchSavings,
        createSaving,
        depositToSaving,
        withdrawFromSaving,
        loading,
        error,
    } = useSavingsStore();
    const { user } = useAuthStore();
    const { getDashboard, getTransactions } = useTransactionStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [selectedSavingId, setSelectedSavingId] = useState<string | null>(null);
    const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchSavings();
        getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
        getTransactions();
    }, [fetchSavings, getDashboard]);

    const handleCreateSaving = useCallback(
        async (newSaving: any) => {
            try {
                await createSaving(newSaving);
                fetchSavings();
            } catch (err: any) {
                console.log("Savings Error", err.message);
            }
        },
        [createSaving, fetchSavings]
    );

    const handleDepositWithdraw = useCallback(async () => {
        if (!selectedSavingId || !user) return;

        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Enter a valid amount");
            return;
        }

        try {
            if (depositType === "deposit") {
                await depositToSaving(selectedSavingId, { userId: user._id, amount });
            } else {
                await withdrawFromSaving(selectedSavingId, { userId: user._id, amount });
            }

            setDepositModalVisible(false);
            setDepositAmount("");
            fetchSavings();
            await getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
        } catch (err: any) {
            console.log("Error", err.message);
            alert(err.message || "An error occurred");
        }
    }, [
        selectedSavingId,
        depositAmount,
        depositType,
        user,
        depositToSaving,
        withdrawFromSaving,
        fetchSavings,
        getDashboard,
    ]);

    const openDepositModal = (id: string, type: "deposit" | "withdraw") => {
        setSelectedSavingId(id);
        setDepositType(type);
        setDepositModalVisible(true);
    };

    const displayedSavings = showAll ? savings : savings.slice(0, 4);

    return (
        <View style={styles.container}>
            <SectionHeader
                title="My Savings Plans"
                actionLabel="Create Plan"
                onAction={() => setModalVisible(true)}
            />

            {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />}
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={displayedSavings}
                keyExtractor={(item) => item?._id ?? Math.random().toString()}
                renderItem={({ item }) => <SavingCard item={item} onAction={openDepositModal} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ListEmptyComponent={() =>
                    !loading ? <Text style={styles.empty}>No savings yet. Create one!</Text> : null
                }
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSavings} />}
            />

            {savings.length > 2 && (
                <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => setShowAll(!showAll)}
                >
                    <Text style={styles.viewAllText}>{showAll ? "Show Less" : "View All"}</Text>
                </TouchableOpacity>
            )}

            <CreateSavingModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleCreateSaving}
            />

            <DepositModal
                visible={depositModalVisible}
                amount={depositAmount}
                setAmount={setDepositAmount}
                onClose={() => setDepositModalVisible(false)}
                onDeposit={handleDepositWithdraw}
                type={depositType}
            />
        </View>
    );
};

export default Savings;

// --------------------
// Styles
// --------------------
const styles = StyleSheet.create({
    container: { flex: 1, padding: 12, backgroundColor: "#f6f6f6" },

    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    title: { fontSize: 20, fontWeight: "700", color: "#1E1E1E" },
    link: { fontSize: 14, color: "#007bff", fontWeight: "600" },

    horizontalList: { paddingVertical: 8, gap: 10 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        width: 165,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    cardTitle: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: 6 },
    statusContainer: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    statusActive: { backgroundColor: "#4CAF50" },
    statusCompleted: { backgroundColor: "#2196F3" },
    status: { fontSize: 10, fontWeight: "600", color: "#fff" },

    progressWrapper: { marginBottom: 10 },
    progressBackground: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" },
    progressFill: { height: "100%", backgroundColor: "#4CAF50", borderRadius: 3 },
    progressText: { fontSize: 10, color: "#555", marginTop: 4, textAlign: "right" },

    actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    actionBtn: { flex: 1, marginHorizontal: 2, paddingVertical: 6, borderRadius: 8 },
    actionText: { textAlign: "center", color: "#fff", fontWeight: "600", fontSize: 12 },

    viewAllBtn: { alignSelf: "center", marginTop: 8 },
    viewAllText: { color: "#007bff", fontWeight: "600" },

    empty: { textAlign: "center", color: "#999", fontSize: 14, marginTop: 20 },
    error: { color: "red", textAlign: "center", marginBottom: 10 },
});
