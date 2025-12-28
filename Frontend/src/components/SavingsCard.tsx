import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

interface SavingCardProps {
    item: {
        _id: string;
        title: string;
        targetAmount: number;
        currentAmount: number;
        status: string;
    };
    handleDeposit: (id: string) => void;
}

const SavingCard: React.FC<SavingCardProps> = ({ item, handleDeposit }) => {
    const progress =
        item.targetAmount > 0 ? item.currentAmount / item.targetAmount : 0;

    return (
        <View style={styles.card}>
            {/* Title */}
            <Text style={styles.cardTitle}>{item.title}</Text>

            {/* Progress Bar */}
            <View style={styles.progressRow}>
                <Text style={styles.amountText}>Ksh {item.currentAmount}</Text>
                <Text style={styles.amountText}>Ksh {item.targetAmount}</Text>
            </View>
            <Progress.Bar
                progress={progress}
                width={null}
                height={10}
                color="#0e0057"
                unfilledColor="#e0e0e0"
                borderWidth={0}
                style={{ marginVertical: 8 }}
            />

            {/* Deposit Button */}
            <TouchableOpacity
                style={styles.depositBtn}
                onPress={() => handleDeposit(item._id)}
            >
                <Text style={styles.depositText}>+ Deposit 100</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SavingCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#0e0057",
    },
    progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountText: {
        fontSize: 12,
        color: "#333",
    },
    depositBtn: {
        marginTop: 12,
        backgroundColor: "#0e0057",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
    },
    depositText: {
        color: "#fff",
        fontWeight: "600",
    },
});
