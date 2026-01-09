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

    // 🔹 1. Income: Money coming in (+)
    const totalIncome = transactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    // 🔹 2. Expenses: Money going out (-) 
    // We use Math.abs for the UI display later
    const totalExpenses = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    // 🔹 3. Transfers: Savings, Debt/Loan repayments (+/-)
    const totalTransfers = transactions
        .filter((t: any) => t.type === "transfer")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    // 🔹 4. Monthly Net: The total change in wallet balance
    // Because expenses/outflows are already negative, we just SUM
    const monthlyNet = totalIncome + totalExpenses + totalTransfers;

    const formatNumber = (num: number) =>
        num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Statistics</Text>

                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDropdownVisible(true)}
                >
                    <Text style={styles.dropdownText}>{months[selectedMonth - 1]}</Text>
                    <Ionicons name="chevron-down" size={15} color="#0e0057" style={{ marginTop: 2 }} />
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

            {loading && <ActivityIndicator size="large" color="#0e0057" style={{ marginTop: 20 }} />}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!loading && !error && (
                <View style={styles.cardsRow}>
                    {/* Income Card */}
                    <View style={[styles.card, { backgroundColor: "#d4edda" }]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Income</Text>
                            <Ionicons name="arrow-up-circle" size={28} color="#2e7d32" />
                            <Text style={styles.cardValue}>KES {formatNumber(totalIncome)}</Text>
                        </View>
                    </View>

                    {/* Expenses & Outflows Card */}
                    {/* Includes Expenses + negative Transfers (Savings/Debt) */}
                    <View style={[styles.card, { backgroundColor: "#f8d7da" }]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Outflow</Text>
                            <Ionicons name="arrow-down-circle" size={28} color="#c62828" />
                            <Text style={styles.cardValue}>
                                KES {formatNumber(Math.abs(totalExpenses + (totalTransfers < 0 ? totalTransfers : 0)))}
                            </Text>
                        </View>
                    </View>

                    {/* Monthly Net Card */}
                    <View style={[
                        styles.card,
                        { backgroundColor: monthlyNet >= 0 ? "#c1daf7ff" : "#ffdce0" }
                    ]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Net Change</Text>
                            <Ionicons
                                name={monthlyNet >= 0 ? "trending-up" : "trending-down"}
                                size={26}
                                color={monthlyNet >= 0 ? "#287fc6ff" : "#c62828"}
                            />
                            <Text style={styles.cardValue}>KES {formatNumber(monthlyNet)}</Text>
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
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 4, marginBottom: 15 },
    title: { fontSize: 18, fontWeight: "800", color: "#0e0057" },
    dropdownButton: { flexDirection: "row", alignItems: "center", padding: 5 },
    dropdownText: { fontSize: 14, fontWeight: "600", marginRight: 6, color: "#0e0057" },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
    modalContent: { backgroundColor: "#fff", borderRadius: 8, width: 200, maxHeight: 500 },
    modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
    modalItemText: { fontSize: 14, color: "#555" },
    modalItemTextSelected: { fontWeight: "700", color: "#0e0057" },
    errorText: { color: "red", textAlign: 'center', marginTop: 10 },
    cardsRow: { flexDirection: "row", justifyContent: "space-between" },
    card: {
        flex: 1,
        flexDirection: "column",
        margin: 4,
        paddingVertical: 20,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2
    },
    cardRow: { flexDirection: "column", alignItems: "center", gap: 8 },
    cardTitle: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: 'uppercase' },
    cardValue: { fontSize: 13, fontWeight: "800", color: "#0e0057", textAlign: 'center' },
});