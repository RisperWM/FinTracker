import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBudgetStore } from "@/store/budgetStore";

interface BudgetFormModalProps {
    visible: boolean;
    onClose: () => void;
    editingBudget?: {
        id: string;
        title: string;
        date: string;
        targetAmount?: number;
        actualAmount?: number;
    } | null;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
    visible,
    onClose,
    editingBudget,
}) => {
    const { createBudget, updateBudget } = useBudgetStore();
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (editingBudget) {
            setTitle(editingBudget.title);
            setDate(new Date(editingBudget.date));
        } else {
            setTitle("");
            setDate(new Date());
        }
    }, [editingBudget]);

    const handleSubmit = () => {
        if (!title) return;

        const data = {
            title,
            date: date.toISOString().split("T")[0],
            targetAmount: editingBudget?.targetAmount || 0,
            actualAmount: editingBudget?.actualAmount || 0,
        };

        if (editingBudget) {
            updateBudget(editingBudget.id, data);
        } else {
            createBudget(data);
        }

        onClose();
    };

    const onDateChange = (_: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === "ios");
        setDate(currentDate);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.headerText}>
                        {editingBudget ? "Edit Budget" : "Create Budget"}
                    </Text>

                    <TextInput
                        placeholder="Title"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ color: "#333" }}>
                            {date.toDateString()}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onDateChange}
                        />
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.submitButton]}>
                            <Text style={styles.submitText}>
                                {editingBudget ? "Update" : "Create"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        backgroundColor: "#fff",
        width: "90%",
        borderRadius: 20,
        padding: 20,
        elevation: 6,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 16,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        fontSize: 15,
        color: "#333",
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f0f0f0",
    },
    submitButton: {
        backgroundColor: "#2563EB",
    },
    cancelText: {
        color: "#333",
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default BudgetFormModal;