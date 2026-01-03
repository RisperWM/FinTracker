import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    ActivityIndicator,
    Modal,
    TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetStore } from "../store/budgetStore";
import { useTransactionStore } from "../store/transactionStore";
import { useRouter } from "expo-router";
import BudgetItemCard from "./BudgetItemCard";
import BudgetItemFormModal from "./BudgetItemFormModal";
import { QuickLogModal } from "./QuickLogModal";

const { width } = Dimensions.get("window");

interface Props {
    budgetId: string;
}

export const BudgetItemList: React.FC<Props> = ({ budgetId }) => {
    const router = useRouter();
    const { budgets, fetchBudgetItems, deleteBudgetItem, updateBudgetItem, loading } = useBudgetStore();

    const { getTransactions, getDashboard } = useTransactionStore();

    // UI & Modal States
    const [showFormModal, setShowFormModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Search States
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Batch Selection States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const selectionMode = selectedIds.length > 0;

    useEffect(() => {
        if (budgetId) fetchBudgetItems(budgetId);
    }, [budgetId]);

    // Data Logic
    const budget = useMemo(() => budgets.find((b) => b._id === budgetId), [budgets, budgetId]);

    const items = useMemo(() => {
        const baseItems = (budget?.items || []).filter(i => i && i._id);
        if (!searchQuery.trim()) return baseItems;

        return baseItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [budget, searchQuery]);

    const handleAdd = () => {
        setSelectedItem(null);
        setShowFormModal(true);
    };

    const toggleSearch = () => {
        setIsSearching(!isSearching);
        if (isSearching) setSearchQuery("");
    };

    const handleLogSpent = async (val: number) => {
        if (!selectedItem) return;

        setIsProcessing(true);
        try {
            // 1. Update the budget item (Triggers auto-deduct on backend)
            await updateBudgetItem(budgetId, selectedItem._id, {
                spentAmount: (selectedItem.spentAmount || 0) + val
            });

            // 2. Refresh Transaction Context (Balance & Recent History)
            const now = new Date();
            await Promise.all([
                getTransactions(),
                getDashboard(now.getMonth() + 1, now.getFullYear())
            ]);

            setShowLogModal(false);
            setSelectedItem(null);
        } catch (err: any) {
            console.error("QuickLog Error:", err);
            Alert.alert("Sync Failed", "Budget updated, but wallet balance refresh failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBatchDelete = () => {
        Alert.alert(
            "Confirm Delete",
            `Delete ${selectedIds.length} items?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: async () => {
                        const idsToDelete = [...selectedIds];
                        setSelectedIds([]);
                        setIsProcessing(true);
                        try {
                            await Promise.all(idsToDelete.map(id => deleteBudgetItem(budgetId, id)));
                        } catch (err) {
                            Alert.alert("Sync Error", "Some items failed to delete.");
                            fetchBudgetItems(budgetId);
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>

            <Modal transparent visible={isProcessing} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#0e0057" />
                        <Text style={styles.loadingText}>Updating Financial Data...</Text>
                    </View>
                </View>
            </Modal>

            {/* Header Section */}
            <View style={styles.header}>
                {selectionMode ? (
                    <View style={styles.selectionHeader}>
                        <View style={styles.leftSelect}>
                            <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.closeBtn}>
                                <Ionicons name="close" size={26} color="#0e0057" />
                            </TouchableOpacity>
                            <Text style={styles.selectionText}>{selectedIds.length} Selected</Text>
                        </View>
                        <TouchableOpacity onPress={handleBatchDelete} style={styles.headerIconBtn}>
                            <Ionicons name="trash" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ) : isSearching ? (
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search items..."
                            autoFocus
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity onPress={toggleSearch}>
                            <Text style={styles.cancelSearch}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                            <Ionicons name="arrow-back" size={24} color="#0e0057" />
                        </TouchableOpacity>

                        <View style={styles.titleGroup}>
                            <Text style={styles.heading} numberOfLines={1}>{budget?.title || "Items"}</Text>
                            <View style={styles.badgeContainer}>
                                <View style={styles.dot} />
                                <Text style={styles.subheading}>{items.length} Categories</Text>
                            </View>
                        </View>

                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={toggleSearch} style={styles.iconBtn}>
                                <Ionicons name="search-outline" size={24} color="#0e0057" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
                                <Ionicons name="add-circle" size={40} color="#FF9800" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {loading && items.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0e0057" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => `item-${item._id}-${selectionMode}`}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <BudgetItemCard
                            item={{ ...item, budgetId }}
                            onEdit={(it: any) => { setSelectedItem(it); setShowFormModal(true); }}
                            onDelete={(id: any) => deleteBudgetItem(budgetId, id)}
                            onLogSpent={(it: any) => { setSelectedItem(it); setShowLogModal(true); }}
                            isSelected={selectedIds.includes(item._id!)}
                            selectionMode={selectionMode}
                            onPress={() => selectionMode ? setSelectedIds(prev => prev.includes(item._id!) ? prev.filter(i => i !== item._id) : [...prev, item._id!]) : null}
                            onLongPress={() => setSelectedIds([item._id!])}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name={searchQuery ? "search-outline" : "receipt-outline"} size={55} color="#cbd5e1" />
                            <Text style={styles.emptyText}>
                                {searchQuery ? `No results for "${searchQuery}"` : "This folder is empty"}
                            </Text>
                        </View>
                    }
                />
            )}

            <BudgetItemFormModal
                visible={showFormModal}
                onClose={() => setShowFormModal(false)}
                budgetId={budgetId}
                editItem={selectedItem}
            />

            <QuickLogModal
                visible={showLogModal}
                onClose={() => setShowLogModal(false)}
                onSave={handleLogSpent}
                itemTitle={selectedItem?.title || ""}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9f9" },
    center: { flex: 1, justifyContent: 'center' },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 70 },
    selectionHeader: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    leftSelect: { flexDirection: 'row', alignItems: 'center' },
    selectionText: { fontSize: 18, fontWeight: "800", color: "#0e0057", marginLeft: 10 },
    headerIconBtn: { padding: 5 },
    iconBtn: { padding: 5, marginRight: 5 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    titleGroup: { flex: 1 },
    heading: { fontSize: 20, fontWeight: "800", color: "#0e0057" },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 6 },
    subheading: { fontSize: 11, color: "#4CAF50", fontWeight: "700" },
    addBtn: { shadowColor: "#FF9800", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 45, borderWidth: 1, borderColor: '#e2e8f0' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },
    cancelSearch: { marginLeft: 12, color: '#ef4444', fontWeight: '600' },
    closeBtn: {},
    listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 120 },
    emptyContainer: { alignItems: "center", marginTop: 100 },
    emptyText: { color: "#94a3b8", marginTop: 12, fontSize: 16, fontWeight: '500' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    loadingBox: { backgroundColor: '#FFF', padding: 25, borderRadius: 20, alignItems: 'center', width: width * 0.7 },
    loadingText: { marginTop: 15, fontSize: 15, fontWeight: '700', color: '#0e0057' }
});

export default BudgetItemList;