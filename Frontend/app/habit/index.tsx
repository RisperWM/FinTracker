import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { HabitList } from '@/components/HabitList';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const BRAND_BLUE = "#0e0057";
const BRAND_AMBER = "#f59e0b";

const CATEGORIES = [
    { label: "All", color: "#64748b" },
    { label: "Career", color: "#1E3A8A" },
    { label: "Education", color: "#D97706" },
    { label: "Health & Wellness", color: "#065F46" },
    { label: "Spiritual", color: "#5B21B6" },
    { label: "Financial", color: "#0F766E" },
    { label: "Social", color: "#991B1B" },
    { label: "Other", color: "#374151" }
];

export default function HabitTrackerPage() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleOpenCreate = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/habit/create" as any);
    };

    return (
        <View style={styles.container}>
            {/* 🔹 Tinted Header Area */}
            <View style={[styles.headerSection, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerTop}>
                    {/* Left Aligned Title */}
                    <View style={styles.leftTitleGroup}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color={BRAND_BLUE} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.subtitle}>MY IDENTITY</Text>
                            <Text style={styles.headerTitle}>Habits</Text>
                        </View>
                    </View>

                    {/* Blue Circle Add Button with Amber Sign */}
                    <TouchableOpacity onPress={handleOpenCreate} style={styles.addCircleBtn}>
                        <Ionicons name="add" size={28} color={BRAND_AMBER} />
                    </TouchableOpacity>
                </View>

                {/* Search Row */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={16} color="#94a3b8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search rituals..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.dropdownBtn}
                        onPress={() => setIsDropdownOpen(true)}
                    >
                        <Text style={styles.dropdownText} numberOfLines={1}>
                            {activeCategory === "All" ? "Filter" : activeCategory}
                        </Text>
                        <Ionicons name="chevron-down" size={12} color={BRAND_BLUE} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dropdown Modal */}
            <Modal visible={isDropdownOpen} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setIsDropdownOpen(false)}>
                    <View style={[styles.dropdownMenu, { top: insets.top + 120 }]}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.label}
                                style={[styles.menuItem, activeCategory === cat.label && styles.menuItemActive]}
                                onPress={() => {
                                    setActiveCategory(cat.label);
                                    setIsDropdownOpen(false);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                                    <Text style={[styles.menuItemText, activeCategory === cat.label && styles.menuItemTextActive]}>
                                        {cat.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <HabitList
                searchQuery={searchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    headerSection: {
        backgroundColor: "#edf2ff",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingBottom: 10,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    leftTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    backBtn: { paddingRight: 4 },
    subtitle: {
        fontSize: 10,
        color: '#6366f1',
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: -2
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: BRAND_BLUE
    },
    addCircleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: BRAND_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: BRAND_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 46,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: BRAND_BLUE
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 46,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minWidth: 95,
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: 13,
        fontWeight: '700',
        color: BRAND_BLUE,
        marginRight: 4
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    dropdownMenu: {
        position: 'absolute',
        right: 20,
        width: 190,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12
    },
    menuItemActive: { backgroundColor: '#f1f5f9' },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b'
    },
    menuItemTextActive: {
        color: BRAND_BLUE,
        fontWeight: '800'
    }
});