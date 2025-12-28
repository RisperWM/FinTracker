import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetStore } from "../store/budgetStore";
import BudgetItemCard from "./BudgetItemCard";
import BudgetItemFormModal from "./BudgetItemFormModal";
import { useRouter } from "expo-router";

interface BudgetItemListProps {
    budgetId: string;
}

const BudgetItemList: React.FC<BudgetItemListProps> = ({ budgetId }) => {
    const { budgets, addBudgetItem,deleteBudgetItem } = useBudgetStore();
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const budget = budgets.find((b) => b._id === budgetId);
    const items = budget?.items ?? [];

    const router = useRouter();

    const handleAdd = () => {
        setEditItem(null);
        setShowModal(true);
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        deleteBudgetItem(budgetId, id);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=> router.back()} style={styles.addButton}>
                    <Ionicons name="arrow-back" size={26} color="#1E3A8A" />
                </TouchableOpacity>
                <Text style={styles.heading}>{budget?.title || "Budget Items"}</Text>
                <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                    <Ionicons name="add-circle-outline" size={26} color="#1E3A8A" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item._id!}
                renderItem={({ item }) => (
                    <BudgetItemCard item={{...item, budgetId}} onEdit={handleEdit} onDelete={handleDelete} /> 
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No items yet. Add one to get started!</Text>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />

            <BudgetItemFormModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                budgetId={budgetId}
                editItem={editItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 7,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    heading: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1E3A8A",
    },
    addButton: {
        padding: 6,
    },
    emptyText: {
        textAlign: "center",
        color: "#6B7280",
        marginTop: 20,
        fontSize: 14,
    },
});

export default BudgetItemList;
