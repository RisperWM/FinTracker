import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import UserDetails from "@/src/components/UserDetails";
import DashCard from "@/src/components/DashCard";
import Statistic from "@/src/components/Statistic";
import Transaction from "@/src/components/Transaction";
import Savings from "@/src/components/Savings";

export default function Index() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <UserDetails />
        <DashCard />
        <Statistic/>
        <Savings/>
        <Transaction/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4fafb",
  },

});
