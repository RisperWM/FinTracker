import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
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
const FILTERS = ["all", "saving", "loan", "debt", "completed"];

const SavingsScreen = () => {
  const {
    savings,
    fetchAllGoals,
    createSaving,
    updateSaving,
    deleteSaving,
    depositToSaving,
    withdrawFromSaving,
    updateStatus,
    loading
  } = useSavingsStore();

  const { getDashboard, getTransactions } = useTransactionStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Saving | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmount, setDepositAmount] = useState<string>("");

  const isSelectionMode = selectedIds.length > 0;

  const loadData = useCallback(async () => {
    await fetchAllGoals();
    getDashboard(new Date().getMonth() + 1, new Date().getFullYear());
  }, [fetchAllGoals, getDashboard]);

  useEffect(() => {
    loadData();
    getTransactions();
  }, []);

  const filteredData = useMemo(() => {
    if (activeFilter === "completed") {
      return savings.filter(s => s.status === "completed");
    }
    const active = savings.filter(s => s.status !== "completed");
    if (activeFilter === "all") return active;
    return active.filter(s => s.type === activeFilter);
  }, [savings, activeFilter]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchStatusUpdate = async () => {
    if (selectedIds.length === 0) return;
    const firstItem = savings.find(s => s._id === selectedIds[0]);
    // Toggle logic: if first item is completed, mark all as active (Undo). Else mark as completed.
    const targetStatus = firstItem?.status === "completed" ? "active" : "completed";

    for (const id of selectedIds) {
      await updateStatus(id, targetStatus);
    }
    setSelectedIds([]);
    loadData();
  };

  const handleBatchDelete = () => {
    Alert.alert("Purge Protocols", `Delete ${selectedIds.length} records permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          for (const id of selectedIds) await deleteSaving(id);
          setSelectedIds([]);
          loadData();
        }
      }
    ]);
  };

  const handleAction = async () => {
    if (!selectedItem) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      depositType === "deposit" ? await depositToSaving(selectedItem._id, amount) : await withdrawFromSaving(selectedItem._id, amount);
      setDepositModalVisible(false);
      setDepositAmount("");
      loadData();
      getTransactions();
    } catch (err) { }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isSelectionMode ? (
          <View style={styles.selectionRow}>
            <View style={styles.selectionLeft}>
              <TouchableOpacity onPress={() => setSelectedIds([])}>
                <Ionicons name="close" size={26} color="#0e0057" />
              </TouchableOpacity>
              <Text style={styles.selectionCount}>{selectedIds.length}</Text>
            </View>

            <View style={styles.selectionActions}>
              {/* 🔹 Restore Edit Button */}
              {selectedIds.length === 1 && (
                <TouchableOpacity onPress={() => {
                  const item = savings.find(s => s._id === selectedIds[0]);
                  if (item) {
                    setSelectedItem(item);
                    setIsEditing(true);
                    setModalVisible(true);
                    setSelectedIds([]);
                  }
                }} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={22} color="#0e0057" />
                </TouchableOpacity>
              )}
              {/* 🔹 Toggle Status (Complete / Undo) */}
              <TouchableOpacity onPress={handleBatchStatusUpdate} style={styles.actionBtn}>
                <Ionicons
                  name={savings.find(s => s._id === selectedIds[0])?.status === 'completed' ? "refresh-circle" : "checkmark-done-circle"}
                  size={28}
                  color={savings.find(s => s._id === selectedIds[0])?.status === 'completed' ? "#f59e0b" : "#2e7d32"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBatchDelete} style={styles.actionBtn}>
                <Ionicons name="trash" size={26} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View>
              <Text style={styles.headerTitle}>Financial Goals</Text>
              <Text style={styles.headerSubtitle}>Manage Assets</Text>
            </View>
            <TouchableOpacity style={styles.createBtn} onPress={() => { setSelectedItem(null); setIsEditing(false); setModalVisible(true); }}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.createBtnText}>New Plan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.pill, activeFilter === f && styles.activePill]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.pillText, activeFilter === f && styles.activePillText]}>{f.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        numColumns={width > 600 ? 3 : 2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => toggleSelection(item._id)}
            onPress={() => isSelectionMode ? toggleSelection(item._id) : null}
            style={[styles.cardWrapper, selectedIds.includes(item._id) && styles.selectedCard]}
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
            {selectedIds.includes(item._id) && (
              <View style={styles.checkOverlay}>
                <Ionicons name="checkmark-circle" size={22} color="#0e0057" />
              </View>
            )}
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      />

      <CreateSavingModal
        visible={modalVisible}
        initialData={selectedItem}
        isEditing={isEditing}
        onClose={() => setModalVisible(false)}
        onSave={async (data) => {
          isEditing && selectedItem ? await updateSaving(selectedItem._id, data) : await createSaving(data);
          setModalVisible(false);
          loadData();
        }}
      />

      <DepositModal visible={depositModalVisible} amount={depositAmount} setAmount={setDepositAmount} onClose={() => setDepositModalVisible(false)} onConfirm={handleAction} type={depositType} goalType={selectedItem?.type} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, height: 70 },
  selectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  selectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  selectionActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  selectionCount: { fontSize: 20, fontWeight: '900', color: '#0e0057' },
  actionBtn: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#0e0057" },
  headerSubtitle: { fontSize: 13, color: "#64748b", fontWeight: '600' },
  createBtn: { flexDirection: "row", backgroundColor: "#0e0057", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "800", marginLeft: 6, fontSize: 14 },
  filterContainer: { marginVertical: 10 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  activePill: { backgroundColor: "#0e0057", borderColor: "#0e0057" },
  pillText: { color: "#64748b", fontWeight: "800", fontSize: 11 },
  activePillText: { color: "#fff" },
  cardWrapper: { flex: 1, margin: 6, position: 'relative' },
  selectedCard: { opacity: 0.7 },
  checkOverlay: { position: 'absolute', top: 5, right: 5, backgroundColor: '#fff', borderRadius: 12, elevation: 3 },
  columnWrapper: { paddingHorizontal: 14 }
});

export default SavingsScreen;