import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (goalData: any) => Promise<void> | void;
    initialData?: any; // 🔹 Passed from SavingsScreen for editing
    isEditing?: boolean; // 🔹 To toggle UI text
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

    // 🔹 Populate fields when initialData changes (Editing mode)
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
                // Reset fields for New Goal
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
        if (!title || !targetAmount || loading) return;

        setLoading(true);
        try {
            await onSave({
                title,
                type,
                targetAmount: Number(targetAmount),
                description: description || null,
                startDate,
                endDate,
                // Only include default values if creating new
                ...(!isEditing && { currentAmount: 0, status: "active" })
            });
            onClose();
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setLoading(false);
        }
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

                    <Text style={styles.label}>IDENTITY & TARGET</Text>
                    <TextInput
                        placeholder="Goal or Creditor Title"
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
                        <DateTimePicker value={startDate} mode="date" onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
                    )}
                    {showEndPicker && (
                        <DateTimePicker value={endDate} mode="date" onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
                    )}

                    <TextInput
                        placeholder="Optional Note"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
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
                                {isEditing ? "Update Plan" : "Initialize Plan"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(14, 0, 87, 0.4)" },
    modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 20, padding: 20 },
    titleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: "900", color: "#0e0057" },
    label: { fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 8, letterSpacing: 1 },
    typeRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    typeBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    typeBtnActive: { backgroundColor: '#0e0057', borderColor: '#0e0057' },
    typeBtnText: { fontSize: 10, fontWeight: '800', color: '#64748b' },
    input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#f8fafc" },
    dateRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    dateBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 10, backgroundColor: "#f8fafc" },
    dateLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '700', marginBottom: 2 },
    dateText: { color: "#1e293b", fontWeight: "600", fontSize: 13 },
    saveBtn: { backgroundColor: "#0e0057", padding: 16, borderRadius: 15, marginTop: 10, height: 55, justifyContent: 'center' },
    saveText: { color: "#fff", textAlign: "center", fontWeight: "800", fontSize: 15 },
});

export default CreateSavingModal;