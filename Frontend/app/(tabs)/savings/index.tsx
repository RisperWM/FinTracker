import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSavingsStore } from "@/store/savingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import CreateSavingModal from "@/src/components/SavingsModal";
import { DepositModal } from "@/src/components/SavingsDepositModal";
import SavingCard from "@/src/components/SavingsCard";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SavingsScreen = () => {
  const { savings, fetchSavings, createSaving, depositToSaving, withdrawFromSaving, loading, error } = useSavingsStore();
  const { user } = useAuthStore();
  const { getDashboard } = useTransactionStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedSavingId, setSelectedSavingId] = useState<string | null>(null);
  const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchSavings();
    getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
  }, []);

  const handleAction = async () => {
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
      alert(err.message || "Action failed");
    }
  };

  const displayedSavings = useMemo(() =>
    showAll ? savings : savings.slice(0, 4),
    [savings, showAll]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Savings Plans</Text>
          <Text style={styles.headerSubtitle}>Fuel your future goals</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.createBtnText}>Plan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedSavings}
        keyExtractor={(item) => item?._id ?? Math.random().toString()}
        numColumns={width > 600 ? 3 : 2} // Responsive column count
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SavingCard
            item={item}
            onAction={(id:any, type:any) => {
              setSelectedSavingId(id);
              setDepositType(type);
              setDepositModalVisible(true);
            }}
          />
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={80} color="#e0e0e0" />
            <Text style={styles.emptyText}>No seeds planted yet.</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSavings} />}
      />

      {savings.length > 4 && (
        <TouchableOpacity style={styles.viewAllBtn} onPress={() => setShowAll(!showAll)}>
          <Text style={styles.viewAllText}>{showAll ? "Show Less" : "View All Plans"}</Text>
          <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={16} color="#FF9800" />
        </TouchableOpacity>
      )}

      <CreateSavingModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={createSaving} />
      <DepositModal
        visible={depositModalVisible}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onClose={() => setDepositModalVisible(false)}
        onDeposit={handleAction}
        type={depositType}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcfcfc", paddingTop: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  headerTitle: { fontSize: width * 0.06, fontWeight: "900", color: "#0e0057" },
  headerSubtitle: { fontSize: 13, color: "#94a3b8" },
  createBtn: {
    flexDirection: "row",
    backgroundColor: "#0e0057",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 25,
    alignItems: "center",
    elevation: 4
  },
  createBtnText: { color: "#fff", fontWeight: "800", marginLeft: 5 },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 16 },
  listContent: { paddingBottom: 100 },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#f1f5f9'
  },
  viewAllText: { color: "#FF9800", fontWeight: "800", marginRight: 5 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 10 }
});

export default SavingsScreen;