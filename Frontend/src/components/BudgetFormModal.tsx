import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useBudgetStore, Budget } from "@/store/budgetStore";
import { Ionicons } from "@expo/vector-icons";

interface BudgetFormModalProps {
    visible: boolean;
    onClose: () => void;
    editingBudget?: Budget | null;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
    visible,
    onClose,
    editingBudget,
}) => {
    const { createBudget, updateBudget } = useBudgetStore();
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Sync state with editingBudget when modal opens or editingBudget changes
    useEffect(() => {
        if (editingBudget) {
            setTitle(editingBudget.title);
            setDate(editingBudget.date ? new Date(editingBudget.date) : new Date());
        } else {
            setTitle("");
            setDate(new Date());
        }
    }, [editingBudget, visible]);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        const data: Partial<Budget> = {
            title: title.trim(),
            date: date.toISOString().split("T")[0],
        };

        if (editingBudget?._id) {
            await updateBudget(editingBudget._id, data);
        } else {
            await createBudget(data);
        }

        handleClose();
    };

    const handleClose = () => {
        setTitle("");
        setDate(new Date());
        onClose();
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === "ios");
        setDate(currentDate);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.headerText}>
                                    {editingBudget ? "Update Budget Plan" : "New Budget Plan"}
                                </Text>
                                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={22} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            {/* Title Input */}
                            <Text style={styles.label}>PLAN TITLE</Text>
                            <TextInput
                                placeholder="e.g. Monthly Shopping, Christmas..."
                                value={title}
                                onChangeText={setTitle}
                                style={styles.input}
                                placeholderTextColor="#cbd5e1"
                                autoFocus={!editingBudget}
                            />

                            {/* Date Picker Button */}
                            <Text style={styles.label}>TARGET DATE</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="calendar-outline" size={18} color="#0e0057" />
                                <Text style={styles.dateText}>
                                    {date.toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
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

                            {/* Action Buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={handleClose}
                                    style={[styles.button, styles.cancelButton]}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={[styles.button, styles.submitButton]}
                                >
                                    <Text style={styles.submitText}>
                                        {editingBudget ? "Save Changes" : "Create Plan"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(14, 0, 87, 0.4)", // Brand blue with transparency
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: "100%",
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0e0057",
        letterSpacing: -0.5,
    },
    closeBtn: {
        padding: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748b",
        marginBottom: 8,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    input: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        color: "#1e293b",
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 28,
        gap: 10,
    },
    dateText: {
        fontSize: 15,
        color: "#1e293b",
        fontWeight: "600",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#f1f5f9",
    },
    submitButton: {
        backgroundColor: "#0e0057",
        flex: 2, // Submit is the primary action
    },
    cancelText: {
        color: "#64748b",
        fontWeight: "700",
        fontSize: 15,
    },
    submitText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
});

export default BudgetFormModal;