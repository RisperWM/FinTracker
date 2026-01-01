import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      <UserDetails />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.spacing} />

        <DashCard />
        <Statistic />
        <Savings />
        <Transaction />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4fafb",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  spacing: {
    height: 10,
  }
});