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
import { useRouter } from "expo-router"; // Assuming you use expo-router
import { useSavingsStore } from "@/store/savingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import CreateSavingModal from "@/src/components/SavingsModal";
import { DepositModal } from "./SavingsDepositModal";
import SavingCard from "./SavingsCard";
import { Ionicons } from "@expo/vector-icons";

const SectionHeader = ({ title, actionLabel, onAction }: any) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onAction}>
            <Text style={styles.link}>{actionLabel}</Text>
        </TouchableOpacity>
    </View>
);

const Savings = () => {
    const router = useRouter();
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

    useEffect(() => {
        fetchSavings();
        getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
        getTransactions();
    }, []);

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
        if (isNaN(amount) || amount <= 0) return;

        try {
            if (depositType === "deposit") {
                await depositToSaving(selectedSavingId, { userId: user._id, amount });
            } else {
                await withdrawFromSaving(selectedSavingId, { userId: user._id, amount });
            }
            setDepositModalVisible(false);
            setDepositAmount("");
            fetchSavings();
        } catch (err: any) {
            console.log("Error", err.message);
        }
    }, [selectedSavingId, depositAmount, depositType, user, depositToSaving, withdrawFromSaving, fetchSavings]);

    const openDepositModal = (id: string, type: "deposit" | "withdraw") => {
        setSelectedSavingId(id);
        setDepositType(type);
        setDepositModalVisible(true);
    };

    // Logic: show 3 items, then append a dummy item for the "View All" card if needed
    const dataForList = savings.length > 3
        ? [...savings.slice(0, 3), { _id: 'view_all_trigger' }]
        : savings;

    return (
        <View style={styles.container}>
            <SectionHeader
                title="My Savings Plans"
                actionLabel={savings.length === 0 ? "Create Plan" : "View All"}
                onAction={() => {
                    if (savings.length === 0) setModalVisible(true);
                    else router.push("/savings"); // Navigate to main savings page
                }}
            />

            {loading && savings.length === 0 && (
                <ActivityIndicator size="small" color="#0e0057" style={{ marginVertical: 20 }} />
            )}

            <FlatList
                data={dataForList}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => {
                    if (item._id === 'view_all_trigger') {
                        return (
                            <TouchableOpacity
                                style={styles.viewAllCard}
                                onPress={() => router.push("/savings")}
                            >
                                <Ionicons name="arrow-forward-circle" size={40} color="#0e0057" />
                                <Text style={styles.viewAllCardText}>View All</Text>
                            </TouchableOpacity>
                        );
                    }
                    return <SavingCard item={item} onAction={openDepositModal} />;
                }}
                ListEmptyComponent={() =>
                    !loading ? <Text style={styles.empty}>Start saving for your goals today!</Text> : null
                }
            />

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

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12, backgroundColor: "#f8fafc" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: 'center' },
    title: { fontSize: 18, fontWeight: "800", color: "#0e0057" },
    link: { fontSize: 13, color: "#10b981", fontWeight: "700" },
    horizontalList: { paddingBottom: 10, gap: 12 },

    viewAllCard: {
        width: 120,
        height: 160,
        backgroundColor: "#fff",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderStyle: 'dashed'
    },
    viewAllCardText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "700",
        color: "#0e0057"
    },
    empty: { textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 10 },
});

export default Savings;