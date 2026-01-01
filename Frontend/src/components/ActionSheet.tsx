import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionSheetProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ActionSheet: React.FC<ActionSheetProps> = ({
    visible,
    title,
    onClose,
    onEdit,
    onDelete,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <View style={styles.handle} />
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        </View>

                        <TouchableOpacity style={styles.option} onPress={onEdit}>
                            <View style={[styles.iconBox, { backgroundColor: "#f0f2ff" }]}>
                                <Ionicons name="pencil" size={20} color="#0e0057" />
                            </View>
                            <Text style={styles.optionText}>Edit Budget Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.option} onPress={onDelete}>
                            <View style={[styles.iconBox, { backgroundColor: "#fef2f2" }]}>
                                <Ionicons name="trash" size={20} color="#ef4444" />
                            </View>
                            <Text style={[styles.optionText, { color: "#ef4444" }]}>Delete Budget</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
        marginBottom: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f8fafc",
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    optionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
    cancelBtn: {
        marginTop: 15,
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 14,
        backgroundColor: "#f1f5f9",
    },
    cancelText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#64748b",
    },
});

export default ActionSheet;