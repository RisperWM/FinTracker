import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useHabitStore, Habit as HabitType } from "@/store/habitStore";
import { format, subDays, isSameDay, parseISO, startOfDay, differenceInDays } from "date-fns";
import * as Haptics from "expo-haptics";

const BRAND_BLUE = "#0e0057";
const BRAND_AMBER = "#f59e0b";

const CATEGORIES = [
    { label: "All", color: "#64748b" },
    { label: "Career", color: "#1E3A8A" },
    { label: "Education", color: "#D97706" },
    { label: "Health & Wellness", color: "#5f4706" },
    { label: "Spiritual", color: "#5b13ce" },
    { label: "Financial", color: "#2e7d32" },
    { label: "Social", color: "#b81a1a" },
    { label: "Other", color: "#374151" }
];

const CATEGORY_COLORS: Record<string, string> = {
    "Career": "#1E3A8A",
    "Education": "#D97706",
    "Health & Wellness": "#5f4706",
    "Spiritual": "#5b13ce",
    "Financial": "#2e7d32",
    "Social": "#b81a1a",
    "Other": "#374151"
};

interface HabitListProps {
    searchQuery: string;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
}

export const HabitList = ({ searchQuery, activeCategory, setActiveCategory }: HabitListProps) => {
    const { habits, fetchHabits, loading, logs } = useHabitStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => { fetchHabits(); }, []);

    const calculateProgress = (habit: HabitType) => {
        const start = startOfDay(parseISO(habit.startDate));
        const end = habit.endDate ? startOfDay(parseISO(habit.endDate)) : null;
        const today = startOfDay(new Date());

        const totalDays = end ? differenceInDays(end, start) + 1 : 0;
        let currentDay = differenceInDays(today, start) + 1;

        currentDay = Math.max(0, currentDay);
        if (totalDays > 0) currentDay = Math.min(currentDay, totalDays);

        const percentage = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;

        return {
            percentage,
            currentDay,
            totalDays: totalDays > 0 ? totalDays : '∞'
        };
    };

    const calculateStreak = (habitId: string) => {
        const habitLogs = logs && Array.isArray(logs[habitId]) ? logs[habitId] : [];
        if (habitLogs.length === 0) return 0;
        let streak = 0;
        let checkDate = new Date();
        const sortedLogs = [...habitLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        while (true) {
            const dateStr = format(checkDate, "yyyy-MM-dd");
            const logFound = sortedLogs.find(l => l.date === dateStr);
            if (logFound?.status === "Completed") {
                streak++;
                checkDate = subDays(checkDate, 1);
            } else {
                if (streak === 0 && isSameDay(checkDate, new Date())) {
                    checkDate = subDays(checkDate, 1);
                    continue;
                }
                break;
            }
        }
        return streak;
    };

    const filteredHabits = habits.filter(h => {
        const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || h.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const renderHabitCard = ({ item }: { item: HabitType }) => {
        const isSelected = selectedIds.includes(item._id);
        const progress = calculateProgress(item);
        const streak = calculateStreak(item._id);
        const ritualColor = CATEGORY_COLORS[item.category] || BRAND_AMBER;

        return (
            <TouchableOpacity
                onPress={() => {
                    if (isSelectionMode) {
                        setSelectedIds(prev => isSelected ? prev.filter(id => id !== item._id) : [...prev, item._id]);
                    } else {
                        router.push({ pathname: "/habit/[id]", params: { id: item._id } } as any);
                    }
                }}
                onLongPress={() => {
                    setIsSelectionMode(true);
                    setSelectedIds([item._id]);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}
                style={[styles.card, isSelected && styles.selectedCard]}
            >
                <View style={[styles.curveAccent, { backgroundColor: ritualColor }]} />
                <View style={[styles.innerContent, isSelected && { backgroundColor: "#fffcf5" }]}>
                    <View style={[styles.iconContainer, { backgroundColor: `${ritualColor}10` }]}>
                        <Ionicons name={(item.icon as any) || "flash"} size={16} color={ritualColor} />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.description}>
                            Day {progress.currentDay} of {progress.totalDays} • {item.frequency}
                        </Text>
                    </View>

                    <View style={styles.rightSide}>
                        <Text style={[styles.amount, { color: ritualColor }]}>{progress.percentage}%</Text>
                        {streak > 0 && <Text style={styles.streakText}>🔥 {streak}d streak</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {isSelectionMode && (
                <View style={styles.batchHeader}>
                    <TouchableOpacity onPress={() => { setIsSelectionMode(false); setSelectedIds([]); }}>
                        <Text style={styles.headerBtn}>CANCEL</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{selectedIds.length} SELECTED</Text>
                    <TouchableOpacity onPress={() => {/* Delete logic */ }}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )}

            {/* 🔹 Category Horizontal Filter */}
            {!isSelectionMode && (
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScroll}
                    >
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.label}
                                onPress={() => {
                                    setActiveCategory(cat.label);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={[
                                    styles.categoryPill,
                                    activeCategory === cat.label && { backgroundColor: cat.color }
                                ]}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    activeCategory === cat.label && { color: '#fff' }
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <FlatList
                data={filteredHabits}
                renderItem={renderHabitCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 14, paddingTop: 0 }}
                ListEmptyComponent={loading ? <ActivityIndicator color={BRAND_BLUE} style={{ marginTop: 20 }} /> : null}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    batchHeader: { flexDirection: "row", justifyContent: "space-between", padding: 18, backgroundColor: BRAND_BLUE, alignItems: 'center' },
    headerTitle: { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
    headerBtn: { color: BRAND_AMBER, fontWeight: "800", fontSize: 12 },
    categoryScroll: { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, flexDirection: "row", overflow: "hidden", elevation: 2 },
    selectedCard: { borderColor: BRAND_AMBER, borderWidth: 1 },
    curveAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, borderTopRightRadius: 35, borderBottomRightRadius: 35 },
    innerContent: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginLeft: 5, paddingVertical: 12, paddingHorizontal: 14, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
    iconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
    textContainer: { flex: 1 },
    title: { fontSize: 15, fontWeight: "700", color: BRAND_BLUE },
    description: { fontSize: 11, color: "#71717a", marginTop: 2, fontWeight: "500" },
    rightSide: { alignItems: "flex-end" },
    amount: { fontSize: 15, fontWeight: "800" },
    streakText: { fontSize: 10, color: "#a1a1aa", marginTop: 4, fontWeight: "600" },
});