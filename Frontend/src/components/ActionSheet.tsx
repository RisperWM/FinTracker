// components/ActionSheet.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ActionSheetProps {
    visible: boolean;
    title?: string;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const ActionSheet: React.FC<ActionSheetProps> = ({
    visible,
    title,
    onClose,
    onEdit,
    onDelete,
}) => {
    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>{title || "Actions"}</Text>

                    <TouchableOpacity style={styles.option} onPress={onEdit}>
                        <Text style={styles.optionText}>✏️ Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.option, styles.deleteOption]}
                        onPress={onDelete}
                    >
                        <Text style={[styles.optionText, styles.deleteText]}>🗑 Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    sheet: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    option: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    optionText: {
        fontSize: 16,
        color: "#1E3A8A",
        textAlign: "center",
        fontWeight: "600",
    },
    deleteOption: {
        borderBottomWidth: 0,
        marginTop: 6,
    },
    deleteText: {
        color: "#DC2626",
    },
    cancelBtn: {
        marginTop: 14,
        backgroundColor: "#E0F2FE",
        paddingVertical: 10,
        borderRadius: 10,
    },
    cancelText: {
        color: "#1E3A8A",
        textAlign: "center",
        fontWeight: "600",
    },
});

export default ActionSheet;
