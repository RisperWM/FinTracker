import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (amount: number) => void;
    itemTitle: string;
}

export const QuickLogModal: React.FC<Props> = ({ visible, onClose, onSave, itemTitle }) => {
    const [amount, setAmount] = useState("");

    const handleSave = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            onSave(val);
            setAmount("");
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Log Spending</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.subtitle}>How much did you spend on {itemTitle}?</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.currency}>KES</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                autoFocus
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save Log</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(14, 0, 87, 0.4)", justifyContent: "center", padding: 20 },
    container: { width: "100%" },
    content: { backgroundColor: "#fff", borderRadius: 24, padding: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    title: { fontSize: 18, fontWeight: "800", color: "#0e0057" },
    subtitle: { fontSize: 14, color: "#64748b", marginBottom: 20 },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 25 },
    currency: { fontSize: 16, fontWeight: "700", color: "#64748b", marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 18, fontWeight: "700", color: "#1e293b" },
    footer: { flexDirection: "row", gap: 12 },
    cancelBtn: { flex: 1, padding: 15, alignItems: "center", borderRadius: 12, backgroundColor: "#f1f5f9" },
    saveBtn: { flex: 2, padding: 15, alignItems: "center", borderRadius: 12, backgroundColor: "#0e0057" },
    cancelText: { fontWeight: "700", color: "#64748b" },
    saveText: { fontWeight: "700", color: "#fff" }
});