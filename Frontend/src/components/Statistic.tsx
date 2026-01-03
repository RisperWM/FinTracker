import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTransactionStore } from "../store/transactionStore";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Statistic = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear] = useState(new Date().getFullYear());
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const { getTransactions, transactions, loading, error } = useTransactionStore();

    useEffect(() => {
        getTransactions(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const income = transactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const formatNumber = (num: number) => 
        num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Statistics</Text>

                {/* Custom dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDropdownVisible(true)}
                >
                    <Text style={styles.dropdownText}>{months[selectedMonth - 1]}</Text>
                    <Ionicons name="chevron-down" size={15} color="#0e0057"  style ={{marginTop:2}}/>
                </TouchableOpacity>

                <Modal
                    transparent
                    visible={dropdownVisible}
                    animationType="fade"
                    onRequestClose={() => setDropdownVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPressOut={() => setDropdownVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <FlatList
                                data={months}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setSelectedMonth(index + 1);
                                            setDropdownVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalItemText,
                                            selectedMonth === index + 1 && styles.modalItemTextSelected
                                        ]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

            {/* Loading / Error states */}
            {loading && <ActivityIndicator size="large" color="#0e0057" />}
            {error && <Text style={{ color: "red" }}>{error}</Text>}

            {/* Cards */}
            {!loading && !error && (
                <View style={styles.cardsRow}>
                    {/* Income card */}
                    <View style={[styles.card, { backgroundColor: "#d4edda" }]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Income</Text>
                            <Ionicons name="arrow-up-circle" size={28} color="#2e7d32" />
                            <Text style={styles.cardValue}>KES {formatNumber(income)}</Text>
                        </View>
                    </View>

                    {/* Expenses card */}
                    <View style={[styles.card, { backgroundColor: "#f8d7da" }]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Expenses</Text>
                            <Ionicons name="arrow-down-circle" size={28} color="#c62828" />
                            <Text style={styles.cardValue}>KES {formatNumber(expenses)}</Text>
                        </View>
                    </View>

                    {/* Balance card */}
                    <View style={[styles.card, { backgroundColor: "#c1daf7ff" }]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Balance</Text>
                            <Ionicons name="scale" size={26} color="#287fc6ff" />
                            <Text style={styles.cardValue}>KES {formatNumber(income - expenses)}</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default Statistic;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 4 },
    title: { fontSize: 18, fontWeight: "800", color: "#0e0057" },
    dropdownButton: { flexDirection: "row", alignItems: "center", padding: 5},
    dropdownText: { fontSize: 14, fontWeight: "600", marginRight: 6, color:"#0e0057" },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
    modalContent: { backgroundColor: "#fff", borderRadius: 8, width: 200, maxHeight: 500 },
    modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
    modalItemText: { fontSize: 14, color: "#555" },
    modalItemTextSelected: { fontWeight: "700", color: "#0e0057" },
    cardsRow: { flexDirection: "row", justifyContent: "space-between" },
    card: { flex: 1, flexDirection: "column", margin: 4, paddingVertical: 20, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: "#ccc", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
    cardRow: { flexDirection: "column", alignItems: "center", justifyContent: "space-between" },
    cardTitle: { fontSize: 13, fontWeight: "600", color: "#7a7a7aff" },
    cardValue: { fontSize: 15, fontWeight: "600", color: "#000" },
});
