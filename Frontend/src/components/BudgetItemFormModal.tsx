import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetStore } from "../store/budgetStore";

interface BudgetItemFormModalProps {
    visible: boolean;
    onClose: () => void;
    editItem?: any;
    budgetId: string;
}

const BudgetItemFormModal: React.FC<BudgetItemFormModalProps> = ({
    visible,
    onClose,
    editItem,
    budgetId,
}) => {
    const { addBudgetItem, updateBudgetItem, loading } = useBudgetStore();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [spentAmount, setSpentAmount] = useState("");
    const [additionalAmountSpent, setAdditionalAmountSpent] = useState("");


    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setDescription(editItem.description || "");
            setAmount(editItem.amount?.toString() || "");
            setAdditionalAmountSpent(editItem.additionalAmountSpent || 0)
            setSpentAmount((editItem.spentAmount + editItem.additionalAmountSpent)?.toString() || "");
        } else {
            setTitle("");
            setDescription("");
            setAmount("");
            setSpentAmount("");
        }
    }, [editItem, visible]);

    const handleSave = async () => {
        if (!title.trim() || !amount) {
            alert("Please enter a title and amount");
            return;
        }

        const itemData = {
            title,
            description,
            amount: parseFloat(amount),
            spentAmount: parseFloat(spentAmount),
            budgetId,
        };

        if (editItem) {
            await updateBudgetItem(budgetId, editItem._id, itemData);
        } else {
            await addBudgetItem(budgetId, itemData);
        }

        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.titleText}>
                                {editItem ? "Edit Budget Item" : "Add New Item"}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            placeholder="Item title"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={styles.label}>Description (optional)</Text>
                        <TextInput
                            placeholder="Description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            style={[styles.input, styles.textArea]}
                            placeholderTextColor="#9CA3AF"
                            multiline
                        />

                        <Text style={styles.label}>Budgeted Amount</Text>
                        <TextInput
                            placeholder="Total amount"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                        
                        <Text style={styles.label}>Amount Spent</Text>
                        <TextInput
                            placeholder="Spent amount (optional)"
                            value={spentAmount}
                            onChangeText={setSpentAmount}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                        {editItem && <Text style={styles.label}>Add to Amount Spent</Text>}
                        {editItem && <TextInput
                            placeholder="Spent amount (optional)"
                            value={additionalAmountSpent}
                            onChangeText={setAdditionalAmountSpent}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />}
                        

                        {/* Action buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                <Ionicons name="save-outline" size={20} color="#fff" />
                                <Text style={styles.saveText}>
                                    {loading ? "Saving..." : "Save"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    label:{
        fontWeight:"500",
        textTransform:"capitalize",
        fontSize:14,
    },
    input: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 15,
        color: "#111827",
    },
    textArea: {
        height: 70,
        textAlignVertical: "top",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        width: "48%",
    },
    cancelButton: {
        backgroundColor: "#E5E7EB",
    },
    saveButton: {
        backgroundColor: "#047857",
    },
    cancelText: {
        color: "#374151",
        fontWeight: "600",
    },
    saveText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 6,
    },
});

export default BudgetItemFormModal;
