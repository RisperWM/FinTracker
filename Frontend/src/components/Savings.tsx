import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
} from "react-native";
import { useSavingsStore } from "@/store/savingsStore";
import CreateSavingModal from "@/src/components/SavingsModal";

// ------------------------------
// Sub-components
// ------------------------------

const SectionHeader = ({ title, actionLabel, onAction }: any) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onAction}>
            <Text style={styles.link}>{actionLabel}</Text>
        </TouchableOpacity>
    </View>
);

const SavingCard = ({ item, onDeposit }: any) => {
    if (!item) return null;
    const current = Number(item.currentAmount) || 0;
    const target = Number(item.targetAmount) || 1;
    const progress = Math.min(current / target, 1);

    return (
        <View style={styles.card}>
            <View style={styles.titleContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.status}>Status: {item.status}</Text>
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

            <TouchableOpacity style={styles.depositBtn} onPress={onDeposit}>
                <Text style={styles.depositText}>Deposit</Text>
            </TouchableOpacity>
        </View>
    );
};

const DepositModal = ({
    visible,
    amount,
    setAmount,
    onClose,
    onDeposit,
}: {
    visible: boolean;
    amount: string;
    setAmount: (val: string) => void;
    onClose: () => void;
    onDeposit: () => void;
}) => (
    <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.depositModal}>
                <Text style={styles.modalTitle}>Deposit Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: "green" }]}
                        onPress={onDeposit}
                    >
                        <Text style={styles.modalBtnText}>Deposit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

// ------------------------------
// Main Savings Component
// ------------------------------

const Savings = () => {
    const { savings, fetchSavings, createSaving, depositToSaving, loading, error } =
        useSavingsStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [selectedSavingId, setSelectedSavingId] = useState<string | null>(null);
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

    const handleDeposit = useCallback(async () => {
        if (!selectedSavingId) return;
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Enter a valid amount");
            return;
        }
        try {
            await depositToSaving(selectedSavingId, amount);
            setDepositModalVisible(false);
            setDepositAmount("");
        } catch (err: any) {
            console.log("Error", err.message);
        }
    }, [selectedSavingId, depositAmount, depositToSaving]);

    const openDepositModal = (id: string) => {
        setSelectedSavingId(id);
        setDepositModalVisible(true);
    };

    const displayedSavings = showAll ? savings : savings.slice(0, 4);

    return (
        <View style={styles.container}>
            {/* Header */}
            <SectionHeader
                title="My Savings Plans"
                actionLabel="Create Plan"
                onAction={() => setModalVisible(true)}
            />

            {/* Loading & Error states */}
            {loading && <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} />}
            {error && <Text style={styles.error}>{error}</Text>}

            {/* Savings List */}
            <FlatList
                data={displayedSavings}
                keyExtractor={(item) => item?._id ?? Math.random().toString()}
                renderItem={({ item }) => (
                    <SavingCard item={item} onDeposit={() => openDepositModal(item._id)} />
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

            {/* View All Button */}
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

            {/* Create Saving Modal */}
            <CreateSavingModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleCreateSaving}
            />

            {/* Deposit Modal */}
            <DepositModal
                visible={depositModalVisible}
                amount={depositAmount}
                setAmount={setDepositAmount}
                onClose={() => setDepositModalVisible(false)}
                onDeposit={handleDeposit}
            />
        </View>
    );
};

export default Savings;

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: "#fff",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    horizontalList: {
        paddingVertical: 10,
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0e0057",
    },
    progressContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 10,
        borderRadius: 5,
        backgroundColor: "#e0e0e0",
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "green",
        borderRadius: 5,
    },
    amountsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    amountText: {
        color: "#797373ff",
        fontSize: 12,
        fontWeight: "600",
    },
    link: {
        fontSize: 15,
        color: "#007bff",
        fontWeight: "600",
    },
    statusContainer: {
        backgroundColor: "#007bff",
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderBottomLeftRadius: 12,
        borderTopLeftRadius: 12,
        justifyContent: "center",
        textAlign: "center",
    },
    status: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 10,
    },
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
    cardTitle: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 6,
    },
    depositBtn: {
        marginTop: 12,
        padding: 6,
        backgroundColor: "green",
        borderRadius: 8,
    },
    depositText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
    viewAllBtn: {
        alignSelf: "center",
        marginTop: 8,
    },
    viewAllText: {
        color: "#3588d6ff",
        fontWeight: "600",
    },
    empty: {
        textAlign: "center",
        color: "gray",
        fontSize: 16,
        marginTop: 30,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginBottom: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    depositModal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    modalBtnText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "600",
    },
});
