import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTransactionStore } from "@/store/transactionStore";

type Props = {
    visible: boolean;
    onClose: () => void;
    initialData?: any;
    isEditing?: boolean;
};

export const incomeCategories = ["Salary", "Freelance", "Business", "Investments", "Allowance", "Other Income"];
export const expenseCategories = ["Food & Dining", "Housing & Utilities", "Transportation", "Shopping", "Bills & Subscriptions", "Health & Wellness", "Entertainment", "Education", "Miscellaneous", "Friends & Family", "Loan"];

export const AddTransactionPopup: React.FC<Props> = ({ visible, onClose, initialData, isEditing }) => {
    const { addTransaction, updateTransaction, loading, error } = useTransactionStore();

    const [type, setType] = useState<"income" | "expense">("income");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (visible) {
            if (isEditing && initialData) {
                setType(initialData.type);
                setCategory(initialData.category);
                setAmount(initialData.amount.toString());
                setDescription(initialData.description || "");
                setDate(new Date(initialData.date));
            } else {
                setCategory(""); setAmount(""); setDescription(""); setType("income"); setDate(new Date());
            }
            setMessage("");
        }
    }, [visible, initialData, isEditing]);

    const handleSubmit = async () => {
        if (!category || !amount) {
            setMessage("⚠️ Required fields missing");
            return;
        }
        const payload = { type, category, amount: parseFloat(amount), description, date: date.toISOString() };

        const success = isEditing
            ? await updateTransaction(initialData._id, payload)
            : await addTransaction(payload);

        if (success) {
            setMessage(isEditing ? "✅ Updated!" : "✅ Added!");
            setTimeout(() => { onClose(); }, 600);
        }
    };

    const screenWidth = Dimensions.get("window").width;

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { width: screenWidth * 0.9 }]}>
                    <Text style={styles.title}>{isEditing ? "Edit Record" : "New Record"}</Text>

                    <View style={styles.pillSwitch}>
                        {["income", "expense"].map((t) => (
                            <TouchableOpacity key={t}
                                style={[styles.pillButton, type === t && styles.activePill]}
                                onPress={() => setType(t as any)}>
                                <Text style={[styles.pillText, type === t && { color: "#fff" }]}>{t.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker selectedValue={category} onValueChange={(v) => setCategory(v)}>
                            <Picker.Item label="Select..." value="" />
                            {(type === "income" ? incomeCategories : expenseCategories).map(cat => (
                                <Picker.Item key={cat} label={cat} value={cat} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Amount (KES)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0.00" />

                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>{date.toDateString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker value={date} mode="date" onChange={(e, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
                    )}

                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isEditing ? "Save" : "Add"}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    container: { padding: 20, backgroundColor: "#fff", borderRadius: 20 },
    title: { fontSize: 20, fontWeight: "800", color: "#0e0057", marginBottom: 15, textAlign: "center" },
    pillSwitch: { flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 25, padding: 4, marginBottom: 20 },
    pillButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 21 },
    activePill: { backgroundColor: "#0e0057" },
    pillText: { fontWeight: "700", color: "#64748b", fontSize: 12 },
    label: { fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 5, marginLeft: 5 },
    pickerWrapper: { backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 15 },
    input: { backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 12, marginBottom: 15, fontSize: 16 },
    dateButton: { backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 12, marginBottom: 15 },
    dateText: { fontSize: 16, color: "#0e0057", fontWeight: "600" },
    message: { textAlign: "center", color: "#2e7d32", marginBottom: 10, fontWeight: "600" },
    actions: { flexDirection: "row", gap: 10, marginTop: 10 },
    cancelBtn: { flex: 1, padding: 15, alignItems: "center", borderRadius: 12, backgroundColor: "#f1f5f9" },
    submitBtn: { flex: 2, padding: 15, alignItems: "center", borderRadius: 12, backgroundColor: "#0e0057" },
    btnText: { color: "#fff", fontWeight: "800" }
});