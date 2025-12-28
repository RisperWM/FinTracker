import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTransactionStore } from "@/store/transactionStore";

type Props = {
    visible: boolean;
    onClose: () => void;
};

const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Allowance",
    "Other Income",
];

const expenseCategories = [
    "Food & Dining",
    "Housing & Utilities",
    "Transportation",
    "Shopping",
    "Bills & Subscriptions",
    "Health & Wellness",
    "Entertainment",
    "Education",
    "Miscellaneous",
];

export const AddTransactionPopup: React.FC<Props> = ({ visible, onClose }) => {
    const addTransaction = useTransactionStore((state) => state.addTransaction);
    const loading = useTransactionStore((state) => state.loading);
    const error = useTransactionStore((state) => state.error);

    const [type, setType] = useState<"income" | "expense">("income");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!category || !amount) {
            setMessage("⚠️ Please select category and enter amount");
            return;
        }

        const success = await addTransaction({
            type,
            category,
            amount: parseFloat(amount),
            description,
            date: new Date().toISOString(),
        });

        if (success) {
            setMessage("✅ Transaction added!");
            resetForm();
            onClose();
        } else {
            setMessage("❌ Failed to add transaction");
        }
    };

    const resetForm = () => {
        setCategory("");
        setAmount("");
        setDescription("");
        setType("income");
        setMessage("");
    };

    const categories = type === "income" ? incomeCategories : expenseCategories;

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Add Transaction</Text>

                    {/* Switch Income / Expense */}
                    <View style={styles.typeSwitch}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === "income" && styles.active]}
                            onPress={() => setType("income")}
                        >
                            <Text style={styles.typeText}>Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === "expense" && styles.active]}
                            onPress={() => setType("expense")}
                        >
                            <Text style={styles.typeText}>Expense</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Category Dropdown */}
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(value) => setCategory(value)}
                        >
                            <Picker.Item label="-- Select Category --" value="" />
                            {categories.map((cat) => (
                                <Picker.Item key={cat} label={cat} value={cat} />
                            ))}
                        </Picker>
                    </View>

                    {/* Amount */}
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    {/* Description */}
                    <TextInput
                        style={styles.input}
                        placeholder="Description (e.g. Pizza, Gas, Netflix...)"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {message ? <Text style={styles.message}>{message}</Text> : null}
                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.btnText}>{loading ? "Adding..." : "Add"}</Text>
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        width: "85%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
    },
    typeSwitch: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
    },
    typeButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        alignItems: "center",
    },
    active: {
        backgroundColor: "#0e0057",
        borderColor: "#0e0057",
        color:"#FFF"
    },
    typeText: {
        color: "#979696ff",
        fontWeight: "500",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 6,
        overflow: "hidden",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    message: {
        textAlign: "center",
        marginBottom: 8,
        color: "green",
    },
    error: {
        textAlign: "center",
        marginBottom: 8,
        color: "red",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
    },
    cancelBtn: {
        padding: 10,
        marginRight: 10,
    },
    submitBtn: {
        backgroundColor: "#0e0057",
        padding: 10,
        borderRadius: 8,
    },
    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
});
