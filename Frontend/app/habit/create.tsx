import React from 'react';
import { HabitCreateForm } from "@/components/HabitCreate";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

export default function CreateHabitModal() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const isEdit = !!id;

    return (
        <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top }]}>
            <View style={styles.modalHandle} />
            <View style={styles.header}>
                <Text style={styles.title}>{isEdit ? "Edit Habit" : "New Habit"}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>
            <HabitCreateForm habitId={id} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    modalHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: '900', color: '#0e0057' },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }
});