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
  ScrollView,
  Alert,
} from "react-native";
import { useSavingsStore, GoalType, Saving } from "@/store/savingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import CreateSavingModal from "@/src/components/SavingsModal";
import { DepositModal } from "@/src/components/SavingsDepositModal";
import SavingCard from "@/src/components/SavingsCard";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SavingsScreen = () => {
  const {
    savings,
    fetchAllGoals,
    fetchSavings,
    fetchLoans,
    fetchDebts,
    createSaving,
    updateSaving,
    deleteSaving,
    depositToSaving,
    withdrawFromSaving,
    loading
  } = useSavingsStore();

  const { user } = useAuthStore();
  const { getDashboard, getTransactions } = useTransactionStore();

  // Modals & Selection State
  const [modalVisible, setModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Saving | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 🔹 Batch Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [showAll, setShowAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | GoalType>("all");

  const loadData = useCallback(async (filterType: "all" | GoalType) => {
    setActiveFilter(filterType);
    if (filterType === "all") await fetchAllGoals();
    else if (filterType === "saving") await fetchSavings();
    else if (filterType === "loan") await fetchLoans();
    else if (filterType === "debt") await fetchDebts();
    getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
  }, [fetchAllGoals, fetchSavings, fetchLoans, fetchDebts, getDashboard]);

  useEffect(() => {
    loadData("all");
    getTransactions();
  }, []);

  // 🔹 TOGGLE SELECTION
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 🔹 BATCH DELETE HANDLER
  const handleBatchDelete = () => {
    const count = selectedIds.length;
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${count} selected items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            for (const id of selectedIds) {
              await deleteSaving(id);
            }
            setSelectedIds([]);
            loadData(activeFilter);
          }
        }
      ]
    );
  };

  const handleAction = async () => {
    if (!selectedItem || !user) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      if (depositType === "deposit") await depositToSaving(selectedItem._id, amount);
      else await withdrawFromSaving(selectedItem._id, amount);
      setDepositModalVisible(false);
      setDepositAmount("");
      loadData(activeFilter);
      getTransactions();
    } catch (err: any) {
      console.error("Action failed", err.message);
    }
  };

  const displayedSavings = useMemo(() => savings, [savings]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Header logic changes when in selection mode */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <>
            <View style={styles.selectionHeader}>
              <TouchableOpacity onPress={() => setSelectedIds([])}>
                <Ionicons name="close" size={24} color="#0e0057" />
              </TouchableOpacity>
              <Text style={styles.selectionCount}>{selectedIds.length} Selected</Text>
            </View>
            <View style={styles.headerActions}>
              {selectedIds.length === 1 && (
                <TouchableOpacity
                  onPress={() => {
                    const item = savings.find(s => s._id === selectedIds[0]);
                    if (item) {
                      setSelectedItem(item);
                      setIsEditing(true);
                      setModalVisible(true);
                      setSelectedIds([]);
                    }
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil" size={20} color="#0e0057" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleBatchDelete} style={styles.actionBtn}>
                <Ionicons name="trash" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.headerTitle}>Financial Goals</Text>
              <Text style={styles.headerSubtitle}>Savings, Loans & Debts</Text>
            </View>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => {
                setSelectedItem(null);
                setIsEditing(false);
                setModalVisible(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.createBtnText}>New</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {["all", "saving", "loan", "debt"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.pill, activeFilter === f && styles.activePill]}
              onPress={() => loadData(f as any)}
            >
              <Text style={[styles.pillText, activeFilter === f && styles.activePillText]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayedSavings}
        keyExtractor={(item) => item._id}
        numColumns={width > 600 ? 3 : 2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item._id);
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => toggleSelection(item._id)}
              onPress={() => isSelectionMode ? toggleSelection(item._id) : null}
              style={[styles.cardWrapper, isSelected && styles.selectedCardWrapper]}
            >
              <SavingCard
                item={item}
                onAction={(id: string, type: any) => {
                  if (isSelectionMode) return;
                  setSelectedItem(item);
                  setDepositType(type);
                  setDepositModalVisible(true);
                }}
              />
              {isSelected && (
                <View style={styles.selectionOverlay}>
                  <Ionicons name="checkmark-circle" size={24} color="#0e0057" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadData(activeFilter)} />}
      />

      <CreateSavingModal
        visible={modalVisible}
        initialData={selectedItem}
        isEditing={isEditing}
        onClose={() => setModalVisible(false)}
        onSave={async (data) => {
          if (isEditing && selectedItem) await updateSaving(selectedItem._id, data);
          else await createSaving(data);
          loadData(activeFilter);
        }}
      />

      <DepositModal
        visible={depositModalVisible}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onClose={() => setDepositModalVisible(false)}
        onDeposit={handleAction}
        type={depositType}
        goalType={selectedItem?.type}
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
    height: 60,
    marginBottom: 10
  },
  selectionHeader: { flexDirection: 'row', alignItems: 'center' },
  selectionCount: { fontSize: 18, fontWeight: '800', color: '#0e0057', marginLeft: 15 },
  headerActions: { flexDirection: 'row', gap: 20 },
  actionBtn: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0e0057" },
  headerSubtitle: { fontSize: 13, color: "#94a3b8" },
  createBtn: { flexDirection: "row", backgroundColor: "#0e0057", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 25, alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "800", marginLeft: 5 },
  filterContainer: { marginBottom: 15 },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  pill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  activePill: { backgroundColor: "#0e0057", borderColor: "#0e0057" },
  pillText: { color: "#64748b", fontWeight: "700", fontSize: 12 },
  activePillText: { color: "#fff" },
  cardWrapper: { flex: 1, position: 'relative', margin: 4 },
  selectedCardWrapper: { opacity: 0.7 },
  selectionOverlay: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 12 },
  listContent: { paddingBottom: 100 },
});

export default SavingsScreen;