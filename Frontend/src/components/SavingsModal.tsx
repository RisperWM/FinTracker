import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (newSaving: any) => void;
}

const CreateSavingModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [description, setDescription] = useState("");

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleSave = () => {
        if (!title || !targetAmount) return; 
        onSave({
            title,
            targetAmount: Number(targetAmount),
            description: description || null,
            currentAmount: 0,
            startDate,
            endDate,
            status: "active",
        });
        onClose();
        setTitle("");
        setTargetAmount("");
        setDescription("");
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.modalTitle}>Create New Saving</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={25} color="#1c0a79ff" style={{}}/>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        placeholder="Title"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Target Amount"
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    {/* Start Date */}
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateBtn}>
                        <Text style={styles.dateText}>
                            Start Date: {startDate.toDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, selectedDate) => {
                                setShowStartPicker(false);
                                if (selectedDate) setStartDate(selectedDate);
                            }}
                        />
                    )}

                    {/* End Date */}
                    <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateBtn}>
                        <Text style={styles.dateText}>
                            End Date: {endDate.toDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, selectedDate) => {
                                setShowEndPicker(false);
                                if (selectedDate) setEndDate(selectedDate);
                            }}
                        />
                    )}

                    <TextInput
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                    />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CreateSavingModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    titleContainer:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignContent:"center",
        textAlign:"center"
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#0e0057"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
    },
    dateBtn: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    dateText: {
        color: "#333",
    },
    saveBtn: {
        backgroundColor: "#0e0057",
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
    },
    saveText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600"
    },
    cancelBtn: {
        padding: 10,
        backgroundColor: "red",
        borderRadius: 6,
    },
    cancelText: {
        textAlign: "center",
        color: "white"
    },
});
