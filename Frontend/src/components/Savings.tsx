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
import CreateSavingModal from "@/src/components/SavingsModal";
import { DepositModal } from "./SavingsDepositModal";

// ------------------------------
// Section Header
// ------------------------------
const SectionHeader = ({ title, actionLabel, onAction }: any) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onAction}>
            <Text style={styles.link}>{actionLabel}</Text>
        </TouchableOpacity>
    </View>
);

// ------------------------------
// Saving Card
// ------------------------------
const SavingCard = ({ item, onAction }: any) => {
    if (!item) return null;

    const current = Number(item.currentAmount) || 0;
    const target = Number(item.targetAmount) || 1;
    const progress = Math.min(current / target, 1);

    return (
        <View style={styles.card}>
            <View style={styles.titleContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.status}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
                    />
                </View>
                <View style={styles.amountsRow}>
                    <Text style={styles.amountText}>Ksh {current}</Text>
                    <Text style={styles.amountText}>Ksh {target}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "green" }]}
                    onPress={() => onAction(item._id, "deposit")}
                >
                    <Text style={styles.actionText}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "orange" }]}
                    onPress={() => onAction(item._id, "withdraw")}
                >
                    <Text style={styles.actionText}>Withdraw</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ------------------------------
// Main Savings Component
// ------------------------------
const Savings = () => {
    const { savings, fetchSavings, createSaving, depositToSaving, withdrawFromSaving, loading, error } =
        useSavingsStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [selectedSavingId, setSelectedSavingId] = useState<string | null>(null);
    const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchSavings();
    }, [fetchSavings]);

    const handleCreateSaving = useCallback(async (newSaving: any) => {
        try {
            await createSaving(newSaving);
        } catch (err: any) {
            console.log("Savings Error", err.message);
        }
    }, [createSaving]);

    const handleDepositWithdraw = useCallback(async () => {
        if (!selectedSavingId) return;
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Enter a valid amount");
            return;
        }

        try {
            if (depositType === "deposit") {
                await depositToSaving(selectedSavingId, amount);
            } else {
                await withdrawFromSaving(selectedSavingId, amount);
            }
            setDepositModalVisible(false);
            setDepositAmount("");
        } catch (err: any) {
            console.log("Error", err.message);
        }
    }, [selectedSavingId, depositAmount, depositType, depositToSaving, withdrawFromSaving]);

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

            {loading && <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} />}
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={displayedSavings}
                keyExtractor={(item) => item?._id ?? Math.random().toString()}
                renderItem={({ item }) => (
                    <SavingCard item={item} onAction={openDepositModal} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ListEmptyComponent={() =>
                    !loading ? <Text style={styles.empty}>No savings yet. Create one!</Text> : null
                }
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchSavings} />
                }
            />

            {savings.length > 2 && (
                <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => setShowAll(!showAll)}
                >
                    <Text style={styles.viewAllText}>
                        {showAll ? "Show Less" : "View All"}
                    </Text>
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
            />
        </View>
    );
};

export default Savings;

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
    container: { flex: 1, padding: 12, backgroundColor: "#fff" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    title: { fontSize: 18, fontWeight: "800", color: "#0e0057" },
    link: { fontSize: 15, color: "#007bff", fontWeight: "600" },
    horizontalList: { paddingVertical: 10, gap: 10 },
    titleContainer: { flexDirection: "row", justifyContent: "space-between" },
    card: {
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 12,
        marginBottom: 14,
        width: 200,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
    statusContainer: {
        backgroundColor: "#007bff",
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderBottomLeftRadius: 12,
        borderTopLeftRadius: 12,
        justifyContent: "center",
    },
    status: { color: "#fff", fontWeight: "500", fontSize: 10 },
    progressContainer: { marginVertical: 8 },
    progressBarBackground: { height: 10, borderRadius: 5, backgroundColor: "#e0e0e0", overflow: "hidden" },
    progressBarFill: { height: "100%", backgroundColor: "green", borderRadius: 5 },
    amountsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    amountText: { color: "#797373ff", fontSize: 12, fontWeight: "600" },
    actionBtn: { marginTop: 10, padding: 8, borderRadius: 8, flex: 1, marginHorizontal: 3 },
    actionText: { color: "#fff", textAlign: "center", fontWeight: "600" },
    viewAllBtn: { alignSelf: "center", marginTop: 8 },
    viewAllText: { color: "#3588d6ff", fontWeight: "600" },
    empty: { textAlign: "center", color: "gray", fontSize: 16, marginTop: 30 },
    error: { color: "red", textAlign: "center", marginBottom: 10 },
});
