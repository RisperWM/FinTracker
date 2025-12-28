import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTransactionStore } from "../store/transactionStore";

const Statistic = () => {
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

    const [selectedYear] = useState(new Date().getFullYear());

    const { getTransactions, transactions, loading, error } = useTransactionStore();

    useEffect(() => {
        getTransactions(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    // calculate totals from transactions
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
                <View style={styles.dropdownWrapper}>
                    <Picker
                        selectedValue={selectedMonth}
                        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                        style={styles.dropdown}
                        dropdownIconColor="#0e0057"
                    >
                        {[
                            { label: "January", value: 1 },
                            { label: "February", value: 2 },
                            { label: "March", value: 3 },
                            { label: "April", value: 4 },
                            { label: "May", value: 5 },
                            { label: "June", value: 6 },
                            { label: "July", value: 7 },
                            { label: "August", value: 8 },
                            { label: "September", value: 9 },
                            { label: "October", value: 10 },
                            { label: "November", value: 11 },
                            { label: "December", value: 12 },
                        ].map((month) => (
                            <Picker.Item
                                key={month.value}
                                label={month.label}
                                value={month.value}
                                color={selectedMonth === month.value ? "#0e0057" : "#555"}
                                style={
                                    selectedMonth === month.value
                                        ? styles.dropdownItemSelected
                                        : styles.dropdownItem
                                }
                            />
                        ))}

                    </Picker>
                </View>
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
                            <View style={styles.amountContainer}>
                                <Text style={styles.cardTitle}>Income</Text>
                                <Ionicons
                                    name="arrow-up-circle"
                                    size={28}
                                    color="#2e7d32"
                                />
                            </View>
                            
                            <Text style={styles.cardValue}>
                                KES {formatNumber(income)}
                            </Text>
                        </View>
                    </View>

                    {/* Expenses card */}
                    <View style={[styles.card, { backgroundColor: "#f8d7da" }]}>
                        <View style={styles.cardRow}>
                            <View style={styles.amountContainer}>
                                <Text style={styles.cardTitle}>Expenses</Text>
                                <Ionicons
                                    name="arrow-down-circle"
                                    size={28}
                                    color="#c62828"
                                />
                            </View>
                            
                            <Text style={styles.cardValue}>
                                KES {formatNumber(expenses)}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: "#c1daf7ff" }]}>
                        <View style={styles.cardRow}>
                            <View style={styles.amountContainer}>
                                <Text style={styles.cardTitle}>Balance</Text>
                                <Ionicons
                                    name="scale"
                                    size={26}
                                    color="#287fc6ff"
                                />
                            </View>
                            
                            <Text style={styles.cardValue}>
                                KES {formatNumber(income - expenses)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default Statistic;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0e0057",
    },
    dropdownWrapper: {
        overflow: "hidden",
        height: 40,
        width: 120,
        justifyContent: "center",
    },
    dropdown: {
        height: 50,
        width: "100%",
        color: "#0e0057",
        fontWeight: "600",
    },
    dropdownItem: {
        fontSize: 15,
        color: "#555",
        fontWeight: "400",
    },
    dropdownItemSelected: {
        fontSize: 15,
        color: "#0e0057",
        fontWeight: "700",
    },
    cardsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    card: {
        flex: 1,
        flexDirection:"column",
        margin: 4,
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    cardRow: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#7a7a7aff",
    },
    cardValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
    },
    amountContainer: {
        flexDirection: "row",
        justifyContent:"space-between",
        alignItems:"center"
    },
});
