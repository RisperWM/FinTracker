import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

interface DepositModalProps {
    visible: boolean;
    amount: string;
    setAmount: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
    onDeposit: () => Promise<void> | void;
    type: "deposit" | "withdraw";
    goalType?: "saving" | "loan" | "debt";
}

export const DepositModal: React.FC<DepositModalProps> = ({
    visible, amount, setAmount, onClose, onDeposit, type, goalType
}) => {
    // 🔹 Track local loading state to disable button
    const [isSubmitting, setIsSubmitting] = useState(false);

    let titleText = "";
    if (type === "deposit") {
        titleText = goalType === "saving" ? "Deposit to Savings" : "Submit Repayment";
    } else {
        titleText = goalType === "saving" ? "Withdraw Funds" : "Increase Borrowing";
    }

    const btnColor = type === "deposit" ? "#2e7d32" : "#f59e0b";

    // 🔹 Wrapper to handle button disabling
    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onDeposit();
        } finally {
            // We set this back so that if the modal stays open (on error), 
            // the button becomes clickable again.
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
            // Reset submitting state when modal is hidden
            onShow={() => setIsSubmitting(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.depositModal}>
                    <Text style={styles.modalTitle}>{titleText}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        editable={!isSubmitting} // Disable input while submitting
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
                            onPress={handleConfirm}
                            disabled={isSubmitting} // 🔹 Disable button here
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
    depositModal: { backgroundColor: "#fff", padding: 20, borderRadius: 15, width: "85%" },
    modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 15, color: "#0e0057" },
    input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    modalBtn: { flex: 1, padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center', minHeight: 50 },
    modalBtnText: { textAlign: "center", color: "#fff", fontWeight: "700" },
});