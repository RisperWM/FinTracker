import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (goalData: any) => Promise<boolean | void>; // Updated to match store return type
    initialData?: any;
    isEditing?: boolean;
}

const CreateSavingModal: React.FC<Props> = ({ visible, onClose, onSave, initialData, isEditing }) => {
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"saving" | "loan" | "debt">("saving");
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialData && isEditing) {
                setTitle(initialData.title || "");
                setTargetAmount(initialData.targetAmount?.toString() || "");
                setDescription(initialData.description || "");
                setType(initialData.type || "saving");
                setStartDate(initialData.startDate ? new Date(initialData.startDate) : new Date());
                setEndDate(initialData.endDate ? new Date(initialData.endDate) : new Date());
            } else {
                setTitle("");
                setTargetAmount("");
                setDescription("");
                setType("saving");
                setStartDate(new Date());
                setEndDate(new Date());
            }
        }
    }, [visible, initialData, isEditing]);

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Required", "Please enter a title.");
        if (!targetAmount || Number(targetAmount) <= 0) return Alert.alert("Required", "Please enter a valid target amount.");
        if (endDate < startDate) return Alert.alert("Invalid Date", "Deadline cannot be before the start date.");

        setLoading(true);
        try {
            const success = await onSave({
                title: title.trim(),
                type,
                targetAmount: Number(targetAmount),
                description: description.trim() || null,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                ...(!isEditing && { currentAmount: 0, status: "active" })
            });

            // Only close if the save was successful
            if (success !== false) {
                onClose();
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get descriptive text based on type
    const getHelpText = () => {
        if (type === 'loan') return "Lending money will immediately deduct from your wallet.";
        if (type === 'debt') return "Borrowing will immediately increase your wallet balance.";
        return "Savings goals track your progress as you deposit money.";
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.modalTitle}>
                            {isEditing ? "Modify Protocol" : "New Financial Protocol"}
                        </Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Ionicons name="close" size={24} color="#0e0057" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>CLASSIFICATION</Text>
                    <View style={styles.typeRow}>
                        {["saving", "loan", "debt"].map((t: any) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                                disabled={loading}
                            >
                                <Text style={[styles.typeBtnText, type === t && { color: '#fff' }]}>
                                    {t.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.helpText}>{getHelpText()}</Text>

                    <Text style={styles.label}>IDENTITY & TARGET</Text>
                    <TextInput
                        placeholder={type === 'saving' ? "e.g. New Car" : "e.g. Loan to John"}
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        editable={!loading}
                    />
                    <TextInput
                        placeholder="Target Amount (KES)"
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        editable={!loading}
                    />

                    <Text style={styles.label}>TIMELINE</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity
                            onPress={() => setShowStartPicker(true)}
                            style={[styles.dateBtn, { flex: 1 }]}
                            disabled={loading}
                        >
                            <Text style={styles.dateLabel}>Start</Text>
                            <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowEndPicker(true)}
                            style={[styles.dateBtn, { flex: 1 }]}
                            disabled={loading}
                        >
                            <Text style={styles.dateLabel}>Deadline</Text>
                            <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
                        />
                    )}
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            minimumDate={startDate}
                            onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
                        />
                    )}

                    <TextInput
                        placeholder="Optional Note"
                        value={description}
                        onChangeText={setDescription}
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        multiline
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && { backgroundColor: '#94a3b8' }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveText}>
                                {isEditing ? "Update Strategy" : "Initialize Strategy"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(14, 0, 87, 0.6)" },
    modalContent: { width: "92%", backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    titleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "900", color: "#0e0057" },
    label: { fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 8, letterSpacing: 1.2 },
    helpText: { fontSize: 11, color: "#64748b", marginBottom: 15, fontStyle: 'italic' },
    typeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    typeBtnActive: { backgroundColor: '#0e0057', borderColor: '#0e0057' },
    typeBtnText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
    input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 14, padding: 14, marginBottom: 14, backgroundColor: "#f8fafc", color: "#0e0057", fontWeight: "600" },
    dateRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
    dateBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 14, padding: 12, backgroundColor: "#f8fafc" },
    dateLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', marginBottom: 4 },
    dateText: { color: "#0e0057", fontWeight: "700", fontSize: 14 },
    saveBtn: { backgroundColor: "#0e0057", padding: 18, borderRadius: 16, marginTop: 10, shadowColor: "#0e0057", shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
    saveText: { color: "#fff", textAlign: "center", fontWeight: "900", fontSize: 16, letterSpacing: 0.5 },
});

export default CreateSavingModal;