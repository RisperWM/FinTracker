import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 🔹 Precise safe area
import { useBudgetStore } from "../store/budgetStore";
import BudgetCard from "./BudgetCard";
import { BudgetFormModal } from "./BudgetFormModal";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const BudgetList = () => {
    const insets = useSafeAreaInsets(); // 🔹 Get exact system insets
    const { budgets, fetchBudgets, fetchBudgetItems, deleteBudget } = useBudgetStore();
    const [showModal, setShowModal] = useState(false);
    const [editBudget, setEditBudget] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isInitialSync, setIsInitialSync] = useState(true);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const selectionMode = selectedIds.length > 0;

    useEffect(() => {
        const syncAppData = async () => {
            try {
                await fetchBudgets();
                const currentBudgets = useBudgetStore.getState().budgets;
                await Promise.all(
                    currentBudgets.map(budget => 
                        budget._id ? fetchBudgetItems(budget._id) : Promise.resolve()
                    )
                );
            } catch (err) {
                console.error("Critical Sync Error:", err);
            } finally {
                setIsInitialSync(false);
            }
        };
        syncAppData();
    }, []);

    const filteredBudgets = useMemo(() => {
        const list = [...budgets].reverse();
        if (!searchQuery) return list;
        return list.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [budgets, searchQuery]);

    if (isInitialSync) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text style={styles.loaderText}>Syncing Budget Vault...</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            {/* 🔹 Header: Uses insets.top for pixel-perfect spacing */}
            <View style={[styles.headerWrapper, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
                {selectionMode ? (
                    <View style={styles.selectionHeader}>
                        <TouchableOpacity onPress={() => setSelectedIds([])}>
                            <Ionicons name="close" size={28} color="#0e0057" />
                        </TouchableOpacity>
                        <Text style={styles.selectionText}>{selectedIds.length} SELECTED</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                Alert.alert("Delete", "Delete folders?", [
                                    { text: "No" },
                                    { text: "Yes", onPress: async () => {
                                        for (const id of selectedIds) await deleteBudget(id);
                                        setSelectedIds([]);
                                    }}
                                ]);
                            }} 
                            style={styles.trashBtn}
                        >
                            <Ionicons name="trash-outline" size={22} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.topRow}>
                            <View>
                                <Text style={styles.preTitle}>PLANNING CENTER</Text>
                                <Text style={styles.mainTitle}>Budgets</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => { setEditBudget(null); setShowModal(true); }}
                            >
                                <Ionicons name="add-circle" size={48} color="#f59e0b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={18} color="#94a3b8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search folders..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </>
                )}
            </View>

            <FlatList
                data={filteredBudgets}
                keyExtractor={(item) => item._id!}
                contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <BudgetCard
                        budget={item}
                        isSelected={selectedIds.includes(item._id!)}
                        selectionMode={selectionMode}
                        onPress={() => selectionMode ? setSelectedIds(prev => prev.includes(item._id!) ? prev.filter(i => i !== item._id) : [...prev, item._id!]) : null}
                        onLongPress={() => setSelectedIds([item._id!])}
                        onEdit={(b: any) => { setEditBudget(b); setShowModal(true); }}
                        onDelete={deleteBudget}
                    />
                )}
            />

            <BudgetFormModal
                visible={showModal}
                editingBudget={editBudget}
                onClose={() => { setShowModal(false); setEditBudget(null); }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    page: { 
        flex: 1, 
        backgroundColor: "#fcfcfc" 
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 15,
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 2,
    },
    headerWrapper: {
        paddingHorizontal: width * 0.05,
        paddingBottom: 15,
        backgroundColor: '#fff',
        // 🔹 Crisp subtle shadow instead of heavy border
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    preTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 2,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0e0057',
        letterSpacing: -1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginTop: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#0e0057',
    },
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
    },
    selectionText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0e0057',
    },
    trashBtn: {
        backgroundColor: '#fee2e2',
        padding: 10,
        borderRadius: 12,
    },
    addBtn: {
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    list: {
        paddingHorizontal: width * 0.05,
        paddingTop: 20,
    },
});

export default BudgetList;