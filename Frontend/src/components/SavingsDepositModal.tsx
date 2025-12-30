import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface DepositModalProps {
    visible: boolean;
    amount: string;
    setAmount: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
    onDeposit: () => Promise<void> | void;
    type: "deposit" | "withdraw";
}

export const DepositModal: React.FC<DepositModalProps> = ({
    visible,
    amount,
    setAmount,
    onClose,
    onDeposit,
    type,
}) => {
    const titleText = type === "deposit" ? "Enter Deposit Amount" : "Enter Withdrawal Amount";
    const btnColor = type === "deposit" ? "green" : "orange";

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.depositModal}>
                    <Text style={styles.modalTitle}>{titleText}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.modalBtnText, { color: "#000" }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: btnColor }]}
                            onPress={onDeposit}
                        >
                            <Text style={styles.modalBtnText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    depositModal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    modalButtons: { flexDirection: "row", justifyContent: "space-between" },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5 },
    modalBtnText: { textAlign: "center", color: "#fff", fontWeight: "600", fontSize: 16 },
});
