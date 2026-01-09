import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
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
        fetchAllGoals,
        createSaving,
        depositToSaving,
        withdrawFromSaving,
        loading,
    } = useSavingsStore();

    const { user } = useAuthStore();
    const { getDashboard, getTransactions } = useTransactionStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");
    const [depositAmount, setDepositAmount] = useState<string>("");

    useEffect(() => {
        fetchAllGoals();
    }, []);

    const handleCreateSaving = useCallback(
        async (newGoal: any) => {
            try {
                const success = await createSaving(newGoal);
                if (success) {
                    setModalVisible(false);
                    fetchAllGoals();
                    getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
                    getTransactions();
                }
            } catch (err: any) {
                console.error("Creation Error", err.message);
            }
        },
        [createSaving, fetchAllGoals]
    );

    const handleDepositWithdraw = useCallback(async () => {
        if (!selectedItem || !user) return;
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            if (depositType === "deposit") {
                await depositToSaving(selectedItem._id, amount);
            } else {
                await withdrawFromSaving(selectedItem._id, amount);
            }
            setDepositModalVisible(false);
            setDepositAmount("");

            fetchAllGoals();
            getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
            getTransactions();
        } catch (err: any) {
            console.error("Transaction Error", err.message);
        }
    }, [selectedItem, depositAmount, depositType, user, depositToSaving, withdrawFromSaving, fetchAllGoals, getTransactions, getDashboard]);

    const openDepositModal = (item: any, type: "deposit" | "withdraw") => {
        setSelectedItem(item);
        setDepositType(type);
        setDepositModalVisible(true);
    };

    // 🔹 Filter to show ONLY active items on the dashboard
    const activeSavings = savings.filter(item => item.status !== "completed");

    const dataForList = activeSavings.length > 3
        ? [...activeSavings.slice(0, 3), { _id: 'view_all_trigger' }]
        : activeSavings;

    return (
        <View style={styles.container}>
            <SectionHeader
                title="Financial Goals & Debts"
                actionLabel={activeSavings.length === 0 ? "Add New" : "View All"}
                onAction={() => {
                    if (activeSavings.length === 0) setModalVisible(true);
                    else router.push("/savings");
                }}
            />

            {loading && activeSavings.length === 0 && (
                <ActivityIndicator size="small" color="#0e0057" style={{ marginVertical: 20 }} />
            )}

            <FlatList
                data={dataForList}
                keyExtractor={(item: any) => item._id}
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
                    return <SavingCard item={item} onAction={(id: string, type: any) => openDepositModal(item, type)} />;
                }}
                ListEmptyComponent={() =>
                    !loading ? <Text style={styles.empty}>Start tracking your savings and debts today!</Text> : null
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
                onConfirm={handleDepositWithdraw}
                type={depositType}
                goalType={selectedItem?.type}
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
        width: 120, height: 160, backgroundColor: "#fff", borderRadius: 14,
        justifyContent: "center", alignItems: "center", borderWidth: 1,
        borderColor: "#e2e8f0", borderStyle: 'dashed'
    },
    viewAllCardText: { marginTop: 8, fontSize: 14, fontWeight: "700", color: "#0e0057" },
    empty: { textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 10, width: 300 },
});

export default Savings;