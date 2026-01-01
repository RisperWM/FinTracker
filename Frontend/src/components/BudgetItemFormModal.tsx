import React, { useState, useEffect } from "react";
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetStore } from "@/store/budgetStore";

interface Props {
    visible: boolean;
    onClose: () => void;
    budgetId: string;
    editItem?: any;
}

const BudgetItemFormModal: React.FC<Props> = ({ visible, onClose, budgetId, editItem }) => {
    const { addBudgetItem, updateBudgetItem } = useBudgetStore();
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setAmount(editItem.amount.toString());
            setDescription(editItem.description || "");
        } else {
            setTitle("");
            setAmount("");
            setDescription("");
        }
    }, [editItem, visible]);

    const handleSave = async () => {
        if (!title || !amount) return;

        const payload = {
            title,
            amount: Number(amount),
            description,
            spentAmount: editItem ? editItem.spentAmount : 0
        };

        if (editItem) {
            await updateBudgetItem(budgetId, editItem._id, payload);
        } else {
            await addBudgetItem(budgetId, payload);
        }
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{editItem ? "Edit Item" : "New Budget Item"}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>ITEM NAME</Text>
                    <TextInput
                        placeholder="e.g. Rent, Groceries..."
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        placeholderTextColor="#cbd5e1"
                    />

                    <Text style={styles.label}>ALLOCATED AMOUNT (KES)</Text>
                    <TextInput
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#cbd5e1"
                    />

                    <Text style={styles.label}>NOTE (OPTIONAL)</Text>
                    <TextInput
                        placeholder="Add a small note..."
                        value={description}
                        onChangeText={setDescription}
                        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                        multiline
                        placeholderTextColor="#cbd5e1"
                    />

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
        paddingBottom: Platform.OS === 'ios' ? 40 : 24
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#0e0057" },
    label: { fontSize: 11, fontWeight: "700", color: "#64748b", marginBottom: 8, letterSpacing: 0.5 },
    input: {
        backgroundColor: "#f8fafc",
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 20,
        fontSize: 16,
        color: "#1e293b"
    },
    footer: { flexDirection: "row", gap: 12, marginTop: 10 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 15, backgroundColor: "#f1f5f9", alignItems: "center" },
    saveBtn: { flex: 2, padding: 16, borderRadius: 15, backgroundColor: "#0e0057", alignItems: "center" },
    cancelText: { fontWeight: "700", color: "#64748b" },
    saveText: { fontWeight: "700", color: "#fff" }
});

export default BudgetItemFormModal;