import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useBudgetStore } from "../store/budgetStore";
import BudgetCard from "./BudgetCard";
import { BudgetFormModal } from "./BudgetFormModal";
import { Ionicons } from "@expo/vector-icons";


const BudgetList = () => {
    const { budgets, fetchBudgets, deleteBudget } = useBudgetStore();
    const [showModal, setShowModal] = useState(false);
    const [editBudget, setEditBudget] = useState<any>(null);

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert("Delete Budget", "Are you sure you want to delete this budget?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteBudget(id) },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Budget List</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditBudget(null);
                        setShowModal(true);
                    }}
                >
                    <Text style={styles.addText}>+</Text>
                    <Ionicons
                        name="folder"
                        size={28}
                        color="#032642ff"
                    />
                    

                </TouchableOpacity>
            </View>

            <FlatList
                data={[...budgets].reverse()}
                keyExtractor={(item) => item._id!}
                renderItem={({ item }) => (
                    <BudgetCard
                        budget={item}
                        onEdit={(budget) => {
                            setEditBudget(budget);
                            setShowModal(true);
                        }}
                        onDelete={(id) => handleDelete(id)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
            />



            <BudgetFormModal
                visible={showModal}
                onClose={() => setShowModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding:2
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        alignItems: "center"
    },
    heading: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827"
    },
    addButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        flexDirection: "row"
    },
    addText: {
        color: "#000",
        fontWeight: "600"
    },
    listContainer: {
        paddingBottom: 40
    },
});

export default BudgetList;