// src/app/(tabs)/transactions/index.tsx
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import TransactionCard from "@/components/TransactionCard";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics"; // Import Haptics

// Import your categories
import { incomeCategories, expenseCategories } from "@/lib/constants";

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

  // Filter & Selection States
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ category: "", amount: "", description: "" });

  const isSelectionMode = selectedIds.length > 0;

  useEffect(() => {
    if (user?._id) {
      getTransactions(selectedMonth, new Date().getFullYear());
    }
  }, [user?._id, selectedMonth]);

  const filtered = selectedType === "all"
    ? transactions
    : transactions.filter(t => t.type === selectedType);

  const currentCategories = editingItem?.type === "income"
    ? incomeCategories
    : expenseCategories;

  // --- HANDLERS ---

  const handlePress = (item: any) => {
    if (isSelectionMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Light vibration on toggle
      setSelectedIds(prev =>
        prev.includes(item._id) ? prev.filter(id => id !== item._id) : [...prev, item._id]
      );
    } else {
      Haptics.selectionAsync(); // Subtle selection vibration
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Distinct vibration for entering selection mode
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Success vibration
      setEditModalVisible(false);
      setEditingItem(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Error vibration
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Warning vibration for deletion
            setSelectedIds([]);
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header logic */}
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
          <View>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSubtitle}>History & Filters</Text>
          </View>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(v) => setSelectedMonth(v)}
              style={styles.picker}
            >
              <Picker.Item label="All" value={undefined} />
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                <Picker.Item key={m} label={m} value={i + 1} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {/* Tabs */}
      {!isSelectionMode && (
        <View style={styles.tabContainer}>
          {["all", "income", "expense"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(t as any);
              }}
              style={[styles.tab, selectedType === t && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedType === t && styles.activeTabText]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main List */}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No activity found</Text> : null}
      />

      {/* UPDATE MODAL (Same as before but with Haptics on save) */}
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
            <TextInput style={styles.input} keyboardType="numeric" value={editForm.amount} onChangeText={(text) => setEditForm({ ...editForm, amount: text })} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 70 }]} multiline value={editForm.description} onChangeText={(text) => setEditForm({ ...editForm, description: text })} />

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

// ... (Styles remain the same as the previous full-file generation)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E3A8A' },
  headerSubtitle: { fontSize: 13, color: '#71717a', marginTop: -2 },
  pickerBox: { width: 110, height: 40, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee', justifyContent: 'center' },
  picker: { width: '100%' },
  actionBar: { flexDirection: "row", backgroundColor: "#1a1a1a", marginHorizontal: 16, marginTop: 10, marginBottom: 10, padding: 12, borderRadius: 15, alignItems: "center", justifyContent: "space-between" },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  actionGroup: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 4 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#eef0f2', borderRadius: 10, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1E3A8A' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#71717a' },
  activeTabText: { color: '#fff' },
  empty: { textAlign: 'center', marginTop: 40, color: '#adb5bd' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  typeIndicator: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase' },
  modalPickerContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  modalPicker: { height: 50, width: '100%' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 16 },
  modalFooter: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#64748b', fontWeight: '700' },
  saveButton: { backgroundColor: '#1E3A8A' },
  saveButtonText: { color: '#fff', fontWeight: '700' }
});