import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTransactionStore } from "@/store/transactionStore";

type Props = { visible: boolean; onClose: () => void; };

export const incomeCategories = ["Salary", "Freelance", "Business", "Investments", "Allowance", "Other Income"];
export const expenseCategories = ["Food & Dining", "Housing & Utilities", "Transportation", "Shopping", "Bills & Subscriptions", "Health & Wellness", "Entertainment", "Education", "Miscellaneous", "Friends & Family", "Loan"];

export const AddTransactionPopup: React.FC<Props> = ({ visible, onClose }) => {
    const addTransaction = useTransactionStore((state) => state.addTransaction);
    const loading = useTransactionStore((state) => state.loading);
    const error = useTransactionStore((state) => state.error);

    const [type, setType] = useState<"income" | "expense">("income");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) setDate(selectedDate);
    };

    const handleSubmit = async () => {
        if (!category || !amount) {
            setMessage("⚠️ Please select category and enter amount");
            return;
        }
        const success = await addTransaction({ type, category, amount: parseFloat(amount), description, date: date.toISOString() });
        if (success) {
            setMessage("✅ Transaction added!");
            resetForm();
            onClose();
        } else {
            setMessage("❌ Failed to add transaction");
        }
    };

    const resetForm = () => {
        setCategory(""); setAmount(""); setDescription(""); setType("income"); setMessage(""); setDate(new Date());
    };

    const categories = type === "income" ? incomeCategories : expenseCategories;
    const screenWidth = Dimensions.get("window").width;

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={[styles.container, { width: screenWidth * 0.9 }]}>
                        <Text style={styles.title}>Add Transaction</Text>

                        {/* Pill Switch */}
                        <View style={styles.pillSwitch}>
                            {["income", "expense"].map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.pillButton, type === t && styles.activePill]}
                                    onPress={() => setType(t as "income" | "expense")}
                                >
                                    <Text style={[styles.pillText, type === t && { color: "#fff", fontWeight: "600" }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Category */}
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={category} onValueChange={(v) => setCategory(v)}>
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((cat) => <Picker.Item key={cat} label={cat} value={cat} />)}
                            </Picker>
                        </View>

                        {/* Amount */}
                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        {/* Description */}
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter description"
                            value={description}
                            onChangeText={setDescription}
                        />

                        {/* Date */}
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={{ color: "#0e0057", fontWeight: "500" }}>{date.toDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />
                        )}

                        {message ? <Text style={styles.message}>{message}</Text> : null}
                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={[styles.btnText, { color: "#555" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                                <Text style={styles.btnText}>{loading ? "Adding..." : "Add"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 },
    container: { padding: 18, backgroundColor: "#fff", borderRadius: 14, elevation: 5, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
    title: { fontSize: 18, fontWeight: "600", marginBottom: 12, textAlign: "center" },
    pillSwitch: { flexDirection: "row", justifyContent: "center", marginBottom: 12, borderRadius: 50, backgroundColor: "#eee", padding: 2 },
    pillButton: { flex: 1, paddingVertical: 8, borderRadius: 50, alignItems: "center" },
    activePill: { backgroundColor: "#0e0057" },
    pillText: { color: "#555", fontWeight: "500" },
    label: { fontSize: 13, color: "#555", marginBottom: 4, fontWeight: "600" },
    pickerWrapper: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10, overflow: "hidden" },
    input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14, marginBottom: 12, backgroundColor: "#fafafa" },
    dateButton: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12, alignItems: "center", backgroundColor: "#fafafa" },
    message: { textAlign: "center", marginBottom: 8, color: "green", fontSize: 13 },
    error: { textAlign: "center", marginBottom: 8, color: "red", fontSize: 13 },
    actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
    cancelBtn: { paddingVertical: 8, paddingHorizontal: 14, marginRight: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#f8f8f8" },
    submitBtn: { backgroundColor: "#0e0057", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
    btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
