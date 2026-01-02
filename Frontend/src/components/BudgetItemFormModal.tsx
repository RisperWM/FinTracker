import React, { useState, useEffect } from "react";
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetStore } from "@/store/budgetStore";
import { useTransactionStore } from "@/store/transactionStore";

interface Props {
    visible: boolean;
    onClose: () => void;
    budgetId: string;
    editItem?: any;
}

const BRAND_BLUE = "#0e0057";
const BRAND_AMBER = "#f59e0b";

const BudgetItemFormModal: React.FC<Props> = ({ visible, onClose, budgetId, editItem }) => {
    const { addBudgetItem, updateBudgetItem } = useBudgetStore();
    const { getTransactions } = useTransactionStore();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [spentAmount, setSpentAmount] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setAmount(editItem.amount.toString());
            setSpentAmount(editItem.spentAmount?.toString() || "0");
            setDescription(editItem.description || "");
        } else {
            setTitle("");
            setAmount("");
            setSpentAmount("");
            setDescription("");
        }
    }, [editItem, visible]);

    const handleSave = async () => {
        if (!title || !amount) return;

        const payload = {
            title,
            amount: Number(amount),
            description,
            spentAmount: editItem ? Number(spentAmount) : 0
        };

        try {
            if (editItem) {
                await updateBudgetItem(budgetId, editItem._id, payload);
            } else {
                await addBudgetItem(budgetId, payload);
            }

            await getTransactions();

            onClose();
        } catch (error) {
            console.error("Failed to save budget item:", error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>{editItem ? "Edit Item" : "New Budget Item"}</Text>
                            <Text style={styles.headerSubtitle}>Adjust your allocation protocol</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                            <Ionicons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>ITEM NAME</Text>
                        <TextInput
                            placeholder="e.g. Rent, Groceries..."
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                            placeholderTextColor="#cbd5e1"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>ALLOCATED (KES)</Text>
                                <TextInput
                                    placeholder="0.00"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>

                            {editItem && (
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.label, { color: BRAND_AMBER }]}>ALREADY SPENT</Text>
                                    <TextInput
                                        placeholder="0.00"
                                        value={spentAmount}
                                        onChangeText={setSpentAmount}
                                        keyboardType="numeric"
                                        style={[styles.input, styles.spentInput]}
                                        placeholderTextColor="#cbd5e1"
                                    />
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>NOTE (OPTIONAL)</Text>
                        <TextInput
                            placeholder="Add a small note..."
                            value={description}
                            onChangeText={setDescription}
                            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                            multiline
                            placeholderTextColor="#cbd5e1"
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                            <Text style={styles.saveText}>{editItem ? "Update Item" : "Add to Budget"}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(14, 0, 87, 0.4)", justifyContent: "flex-end" },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 24
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 25 },
    headerTitle: { fontSize: 22, fontWeight: "900", color: BRAND_BLUE },
    headerSubtitle: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
    closeIcon: { backgroundColor: "#f1f5f9", padding: 4, borderRadius: 10 },
    label: { fontSize: 10, fontWeight: "800", color: "#64748b", marginBottom: 8, letterSpacing: 1 },
    row: { flexDirection: 'row', gap: 12 },
    input: {
        backgroundColor: "#f8fafc",
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 20,
        fontSize: 16,
        color: "#1e293b",
        fontWeight: "700"
    },
    spentInput: {
        borderColor: BRAND_AMBER + '40',
        color: BRAND_AMBER,
    },
    footer: { flexDirection: "row", gap: 12, marginTop: 10 },
    cancelBtn: { flex: 1, padding: 18, borderRadius: 15, backgroundColor: "#f1f5f9", alignItems: "center" },
    saveBtn: { flex: 2, padding: 18, borderRadius: 15, backgroundColor: BRAND_BLUE, alignItems: "center", shadowColor: BRAND_BLUE, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    cancelText: { fontWeight: "800", color: "#64748b", fontSize: 14 },
    saveText: { fontWeight: "800", color: "#fff", fontSize: 14 }
});

export default BudgetItemFormModal;