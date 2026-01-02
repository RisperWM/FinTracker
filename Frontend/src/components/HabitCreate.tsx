import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Switch,
    ActivityIndicator,
    Alert,
    Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useHabitStore, HabitCategory, HabitFrequency } from "@/store/habitStore";
import * as Haptics from "expo-haptics";
import { format, addMonths, parseISO } from "date-fns";

const { width } = Dimensions.get("window");
const BRAND_BLUE = "#0e0057";
const BRAND_AMBER = "#f59e0b";
const ERROR_RED = "#f43f5e";

const CATEGORIES: { label: HabitCategory; icon: string }[] = [
    { label: "Career", icon: "briefcase" },
    { label: "Education", icon: "school" },
    { label: "Health & Wellness", icon: "heart" },
    { label: "Spiritual", icon: "sunny" },
    { label: "Financial", icon: "wallet" },
    { label: "Social", icon: "chatbubbles" },
    { label: "Other", icon: "ellipsis-horizontal" },
];

export const HabitCreateForm = ({ habitId }: { habitId?: string }) => {
    const { addHabit, updateHabit, deleteHabit, habits } = useHabitStore();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Other" as HabitCategory,
        frequency: "Daily" as HabitFrequency,
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
        color: BRAND_BLUE,
        icon: "extension-puzzle",
        reminderTime: "08:00",
        isActive: true,
    });

    // Pre-fill form if editing
    useEffect(() => {
        if (habitId) {
            const h = habits.find(item => item._id === habitId);
            if (h) {
                setForm({
                    title: h.title,
                    description: h.description || "",
                    category: h.category,
                    frequency: h.frequency,
                    startDate: h.startDate,
                    endDate: h.endDate || "",
                    color: h.color || BRAND_BLUE,
                    icon: h.icon || "extension-puzzle",
                    reminderTime: h.reminderTime || "08:00",
                    isActive: h.isActive,
                });
            }
        }
    }, [habitId, habits]);

    const handleSave = async () => {
        if (!form.title.trim()) {
            Alert.alert("Required", "Please provide a title.");
            return;
        }
        try {
            setLoading(true);
            if (habitId) {
                await updateHabit(habitId, form);
            } else {
                await addHabit(form);
            }
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Habit",
            "This will remove the habit and all its logs. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (habitId) {
                            await deleteHabit(habitId);
                            router.dismissAll(); 
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Section: Identity */}
                <View style={styles.section}>
                    <Text style={styles.label}>HABIT NAME</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Daily Reflection"
                        placeholderTextColor="#94a3b8"
                        value={form.title}
                        onChangeText={(t) => setForm({ ...form, title: t })}
                    />
                    <Text style={[styles.label, { marginTop: 12 }]}>DESCRIPTION</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top', fontSize: 15 }]}
                        placeholder="Small description..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        value={form.description}
                        onChangeText={(t) => setForm({ ...form, description: t })}
                    />
                </View>

                {/* Section: Category */}
                <View style={styles.section}>
                    <Text style={styles.label}>CATEGORY</Text>
                    <View style={styles.grid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.label}
                                onPress={() => setForm({ ...form, category: cat.label })}
                                style={[
                                    styles.gridItem,
                                    form.category === cat.label && styles.gridItemActive,
                                    { width: width > 400 ? '31%' : '48%' }
                                ]}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={18}
                                    color={form.category === cat.label ? BRAND_AMBER : BRAND_BLUE}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[styles.gridText, form.category === cat.label && { color: '#fff' }]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section: Configuration */}
                <View style={styles.section}>
                    <Text style={styles.label}>FREQUENCY</Text>
                    <View style={styles.pillContainer}>
                        {['Daily', 'Weekly', 'Monthly'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setForm({ ...form, frequency: f as any })}
                                style={[styles.pill, form.frequency === f && styles.pillActive]}
                            >
                                <Text style={[styles.pillText, form.frequency === f && { color: BRAND_BLUE }]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.row, { marginTop: 15 }]}>
                        <View style={styles.col}>
                            <Text style={styles.label}>REMINDER</Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="time" size={20} color={BRAND_AMBER} />
                                <TextInput
                                    style={styles.miniInput}
                                    value={form.reminderTime}
                                    onChangeText={(t) => setForm({ ...form, reminderTime: t })}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.row, { marginTop: 15 }]}>
                        <View style={styles.col}>
                            <Text style={styles.label}>START DATE</Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="calendar" size={18} color={BRAND_BLUE} />
                                <TextInput
                                    style={styles.miniInput}
                                    value={form.startDate}
                                    onChangeText={(t) => setForm({ ...form, startDate: t })}
                                />
                            </View>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>END DATE</Text>
                            <View style={styles.inputWithIcon}>
                                <Ionicons name="flag" size={18} color={BRAND_BLUE} />
                                <TextInput
                                    style={styles.miniInput}
                                    value={form.endDate}
                                    onChangeText={(t) => setForm({ ...form, endDate: t })}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section: Status */}
                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel]}>ACTIVE HABIT</Text>
                    <Switch
                        value={form.isActive}
                        onValueChange={(v) => setForm({ ...form, isActive: v })}
                        trackColor={{ false: "#e2e8f0", true: BRAND_BLUE }}
                        thumbColor={form.isActive ? BRAND_AMBER : "#fff"}
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={BRAND_AMBER} />
                    ) : (
                        <Text style={styles.submitBtnText}>
                            {habitId ? "UPDATE CONFIGURATION" : "SAVE CONFIGURATION"}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Optional Delete Button */}
                {habitId && (
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={18} color={ERROR_RED} />
                        <Text style={styles.deleteBtnText}>DELETE HABIT</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { paddingHorizontal: 20, paddingTop: 15 },
    section: { marginBottom: 20 },
    label: { fontSize: 10, fontWeight: "800", color: BRAND_BLUE, marginBottom: 8, letterSpacing: 1 },
    input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, fontSize: 14, color: BRAND_BLUE, fontWeight: "700" },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
    gridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#f8fafc", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
    gridItemActive: { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE },
    gridText: { fontSize: 12, fontWeight: "800", color: BRAND_BLUE },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },
    pillContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#e2e8f0' },
    pill: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    pillActive: { backgroundColor: BRAND_AMBER },
    pillText: { fontSize: 12, fontWeight: "900", color: "#64748b" },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 40 },
    miniInput: { flex: 1, marginLeft: 8, fontSize: 12, fontWeight: "700", color: BRAND_BLUE },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 14, marginBottom: 25 },
    statusLabel: { fontSize: 12, fontWeight: "800", color: BRAND_BLUE, letterSpacing: 1 },
    submitBtn: { backgroundColor: BRAND_BLUE, padding: 18, borderRadius: 14, alignItems: "center", flexDirection: 'row', justifyContent: 'center', shadowColor: BRAND_BLUE, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, marginBottom: 12 },
    submitBtnText: { color: BRAND_AMBER, fontWeight: "900", fontSize: 15, letterSpacing: 1.2 },
    deleteBtn: { padding: 16, borderRadius: 14, alignItems: "center", flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#fee2e2' },
    deleteBtnText: { color: ERROR_RED, fontWeight: "800", fontSize: 13, letterSpacing: 1 }
});