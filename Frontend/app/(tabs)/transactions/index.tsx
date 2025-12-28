import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const { transactions, getTransactions, loading, error } =
    useTransactionStore();
  const user = useAuthStore((state) => state.user);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedType, setSelectedType] = useState<
    "all" | "income" | "expense"
  >("all");

  useEffect(() => {
    if (user?._id) {
      getTransactions(selectedMonth, selectedYear);
    }
  }, [user?._id, selectedMonth, selectedYear]);

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;

    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter locally by type
  const filteredTransactions =
    selectedType === "all"
      ? transactions
      : transactions.filter((t) => t.type === selectedType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.header}>All Transactions</Text>

        {/* Filters */}
        <View style={styles.filterRow}>
          {/* Month Filter */}
          <View style={styles.filter}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(value) => setSelectedMonth(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Months" value={undefined} />
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
              ].map((m) => (
                <Picker.Item key={m.value} label={m.label} value={m.value} />
              ))}
            </Picker>
          </View>

          {/* Year Filter */}
          <View style={styles.filter}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(value) => setSelectedYear(value)}
              style={styles.picker}
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <Picker.Item key={year} label={String(year)} value={year} />
              ))}
            </Picker>
          </View>

          {/* Type Filter */}
          <View style={styles.filter}>
            <Picker
              selectedValue={selectedType}
              onValueChange={(value) => setSelectedType(value)}
              style={styles.picker}
            >
              <Picker.Item label="All" value="all" />
              <Picker.Item label="Income" value="income" />
              <Picker.Item label="Expense" value="expense" />
            </Picker>
          </View>
        </View>

        {/* Content */}
        {loading && <ActivityIndicator size="large" color="#0e0057" />}
        {error && <Text style={{ color: "red" }}>{error}</Text>}

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.transactionRow}>
              <Ionicons
                name={
                  item.type === "income"
                    ? "arrow-up-circle"
                    : "arrow-down-circle"
                }
                size={22}
                color={item.type === "income" ? "#2e7d32" : "#c62828"}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.transTitle}>
                  {item.category || "No category"}
                </Text>
                <Text style={styles.transDesc}>
                  {item.description || "No description"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.transAmount,
                    { color: item.type === "income" ? "#2e7d32" : "#c62828" },
                  ]}
                >
                  KES {Number(item.amount).toLocaleString()}
                </Text>
                <Text style={styles.transDate}>{formatDate(item.date)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No transactions found
              </Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4fafb",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0e0057",
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filter: {
    flex: 1,
    marginHorizontal: 4,
    // borderWidth: 1,
    // borderColor: "#ddd",
    // borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  transDesc: {
    fontSize: 12,
    fontWeight: "400",
    color: "#888",
  },
  transDate: {
    fontSize: 12,
    color: "#888",
  },
  transAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
});
