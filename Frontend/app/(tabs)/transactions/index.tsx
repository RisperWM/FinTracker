import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import TransactionCard from "@/components/TransactionCard";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics";

import { incomeCategories, expenseCategories } from "@/lib/constants";

const { width, height } = Dimensions.get("window");

const TransactionsScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    transactions,
    getTransactions,
    deleteTransaction,
    updateTransaction,
    loading
  } = useTransactionStore();
  const user = useAuthStore((state) => state.user);

  // --- FILTER & SEARCH STATES ---
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ category: "", amount: "", description: "" });

  const isSelectionMode = selectedIds.length > 0;

  useEffect(() => {
    if (user?._id) {
      getTransactions(selectedMonth, selectedYear);
    }
  }, [user?._id, selectedMonth, selectedYear]);

  // 🔹 Advanced Filtering (Type + Search)
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = selectedType === "all" || t.type === selectedType;
      const matchesSearch =
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, selectedType, searchQuery]);

  const currentCategories = editingItem?.type === "income"
    ? incomeCategories
    : expenseCategories;

  // --- HANDLERS ---
  const handlePress = (item: any) => {
    if (isSelectionMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedIds(prev =>
        prev.includes(item._id) ? prev.filter(id => id !== item._id) : [...prev, item._id]
      );
    } else {
      Haptics.selectionAsync();
      setEditingItem(item);
      setEditForm({
        category: item.category,
        amount: item.amount.toString(),
        description: item.description || ""
      });
      setEditModalVisible(true);
    }
  };

  const handleLongPress = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSaveUpdate = async () => {
    if (!editingItem) return;
    const success = await updateTransaction(editingItem._id, {
      category: editForm.category,
      amount: Number(editForm.amount),
      description: editForm.description
    });

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditModalVisible(false);
      setEditingItem(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to update transaction");
    }
  };

  const handleBatchDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Confirm Delete",
      `Permanently remove ${selectedIds.length} transactions?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            for (const id of selectedIds) { await deleteTransaction(id); }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setSelectedIds([]);
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 🔹 Header & Controls */}
      <View style={styles.topSection}>
        {isSelectionMode ? (
          <View style={styles.actionBar}>
            <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.iconBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionText}>{selectedIds.length} Selected</Text>
            <View style={styles.actionGroup}>
              <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.iconBtn}>
                <Ionicons name="arrow-undo-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBatchDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.headerTitleColumn}>
              <Text style={styles.headerTitle}>Transactions</Text>
              <Text style={styles.headerSubtitle}>
                {selectedMonth ? months[selectedMonth - 1] : "All"} {selectedYear}
              </Text>
            </View>

            <View style={styles.filterControls}>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setSelectedMonth(v);
                  }}
                  style={styles.picker}
                  mode="dropdown"
                >
                  <Picker.Item label="Month" value={undefined} color="#94a3b8" />
                  {months.map((m, i) => (
                    <Picker.Item key={m} label={m.substring(0, 3)} value={i + 1} color="#0e0057" />
                  ))}
                </Picker>
              </View>

              <View style={[styles.pickerBox, { marginLeft: 8 }]}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setSelectedYear(v);
                  }}
                  style={styles.picker}
                  mode="dropdown"
                >
                  {years.map((y) => (
                    <Picker.Item key={y} label={y.toString()} value={y} color="#0e0057" />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        )}

        {/* 🔹 Search Bar */}
        {!isSelectionMode && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInner}>
              <Ionicons name="search" size={18} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* 🔹 Toggler Tabs */}
      {!isSelectionMode && (
        <View style={styles.tabContainer}>
          {["all", "income", "expense"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(t as any);
              }}
              style={[styles.tab, selectedType === t && styles.activeTabBlue]}
            >
              <Text style={[styles.tabText, selectedType === t && styles.activeTabText]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 🔹 Transaction List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TransactionCard
            item={item}
            selectionMode={isSelectionMode}
            isSelected={selectedIds.includes(item._id)}
            onPress={() => handlePress(item)}
            onLongPress={() => handleLongPress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0e0057" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color="#cbd5e1" />
              <Text style={styles.empty}>No matching transactions found</Text>
            </View>
          )
        }
      />

      {/* 🔹 Update Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Update Transaction</Text>
                <Text style={[styles.typeIndicator, { color: editingItem?.type === 'income' ? '#2e7d32' : '#c62828' }]}>
                  Editing {editingItem?.type}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.modalPickerContainer}>
              <Picker
                selectedValue={editForm.category}
                onValueChange={(val) => setEditForm({ ...editForm, category: val })}
                style={styles.modalPicker}
              >
                {currentCategories.map((cat: string) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Amount (KES)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editForm.amount}
              onChangeText={(text) => setEditForm({ ...editForm, amount: text })}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              multiline
              value={editForm.description}
              onChangeText={(text) => setEditForm({ ...editForm, description: text })}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveButton]} onPress={handleSaveUpdate}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4fafb" },
  topSection: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitleColumn: { flex: 1 },
  headerTitle: { fontSize: width > 400 ? 22 : 18, fontWeight: '900', color: '#0e0057', letterSpacing: -1 },
  headerSubtitle: { fontSize: 11, color: '#696464ff', fontWeight: '600', textTransform: 'uppercase' },

  filterControls: { flexDirection: 'row', alignItems: 'center' },
  pickerBox: {
    width: width * 0.25,
    height: 35,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  picker: {
    width: 100,
    color: '#0e0057',
    ...Platform.select({
      android: { scaleX: 0.8, scaleY: 0.8 }
    })
  },

  searchContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0e0057', fontWeight: '600' },

  actionBar: { flexDirection: "row", backgroundColor: "#0e0057", marginHorizontal: 16, marginTop: 10, marginBottom: 10, padding: 12, borderRadius: 15, alignItems: "center", justifyContent: "space-between" },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  actionGroup: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 4 },

  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 16, backgroundColor: '#eef0f2', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBlue: { backgroundColor: '#0e0057' },
  tabText: { fontSize: 11, fontWeight: '800', color: '#71717a' },
  activeTabText: { color: '#fff' },

  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  empty: { textAlign: 'center', marginTop: 15, color: '#94a3b8', fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(14, 0, 87, 0.3)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0e0057' },
  typeIndicator: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  label: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalPickerContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  modalPicker: { height: 50, width: '100%' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 16, color: '#0e0057', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#64748b', fontWeight: '700' },
  saveButton: { backgroundColor: '#0e0057' },
  saveButtonText: { color: '#fff', fontWeight: '700' }
});