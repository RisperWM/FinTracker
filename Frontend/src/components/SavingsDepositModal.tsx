import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

interface DepositModalProps {
    visible: boolean;
    amount: string;
    setAmount: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
    onConfirm: () => Promise<void> | void; // Renamed for clarity
    type: "deposit" | "withdraw";
    goalType?: "saving" | "loan" | "debt";
}

export const DepositModal: React.FC<DepositModalProps> = ({
    visible, amount, setAmount, onClose, onConfirm, type, goalType
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Title Logic
    let titleText = "";
    if (type === "deposit") {
        if (goalType === "saving") titleText = "Deposit to Savings";
        else if (goalType === "loan") titleText = "Receive Repayment";
        else titleText = "Submit Repayment";
    } else {
        titleText = "Withdraw Funds";
    }

    const btnColor = type === "deposit" ? "#2e7d32" : "#ef4444";

    const handleConfirmAction = async () => {
        if (!amount || parseFloat(amount) <= 0 || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onConfirm();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
            onShow={() => setIsSubmitting(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.depositModal}>
                    <Text style={styles.modalTitle}>{titleText}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (KES)"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        editable={!isSubmitting}
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: "#f1f5f9" }]}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={[styles.modalBtnText, { color: "#64748b" }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modalBtn,
                                { backgroundColor: isSubmitting ? "#94a3b8" : btnColor }
                            ]}
                            onPress={handleConfirmAction}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.modalBtnText}>Confirm</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    depositModal: { backgroundColor: "#fff", padding: 25, borderRadius: 20, width: "85%" },
    modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 20, color: "#0e0057", textAlign: 'center' },
    input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 15, marginBottom: 25, fontSize: 18, fontWeight: '700', textAlign: 'center' },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    modalBtn: { flex: 1, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    modalBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});