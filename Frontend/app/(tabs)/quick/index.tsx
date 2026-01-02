import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");

const QuickAccessScreen = () => {
    const insets = useSafeAreaInsets();

    const sections = [
        {
            label: "HABITS & LIFESTYLE",
            data: [
                {
                    title: "Habit Tracker",
                    subtitle: "Manage your daily rituals",
                    icon: "calendar-clear",
                    color: "#8b5cf6",
                    path: "/habit",
                },
                {
                    title: "Create New Habit",
                    subtitle: "Start a new identity",
                    icon: "add-circle",
                    color: "#10b981",
                    path: "/habit/create",
                }
            ]
        },
        {
            label: "FINANCIAL ACTIONS",
            data: [
                {
                    title: "New Transaction",
                    subtitle: "Log your daily spending",
                    icon: "card",
                    color: "#3b82f6",
                    path: "/transactions",
                },
                {
                    title: "Savings Goal",
                    subtitle: "Update your piggy bank",
                    icon: "wallet",
                    color: "#f59e0b",
                    path: "/savings",
                }
            ]
        }
    ];

    const handleNavigation = (path: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // We use absolute pathing to ensure it finds the top-level /habit folder
        router.push(path as any);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>Quick</Text>
                    <Text style={styles.headerTitle}>Actions</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeBtn}
                >
                    <Ionicons name="close" size={24} color="#0e0057" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {sections.map((section, sIdx) => (
                    <View key={sIdx} style={styles.sectionContainer}>
                        <Text style={styles.sectionLabel}>{section.label}</Text>

                        {section.data.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={() => handleNavigation(item.path)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon as any} size={26} color={item.color} />
                                </View>

                                <View style={styles.textContainer}>
                                    <Text style={styles.actionTitle}>{item.title}</Text>
                                    <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                                </View>

                                <View style={styles.arrowBox}>
                                    <Ionicons name="chevron-forward" size={16} color="#0e0057" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default QuickAccessScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 20,
    },
    headerSubtitle: { fontSize: 16, color: '#94a3b8', fontWeight: '700' },
    headerTitle: { fontSize: 32, fontWeight: '900', color: '#0e0057', marginTop: -5 },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0e0057',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionContainer: { marginBottom: 30 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1.5,
        marginBottom: 15,
        marginLeft: 5,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: "#0e0057",
        shadowOpacity: 0.06,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    actionTitle: { fontSize: 17, fontWeight: '800', color: '#0e0057' },
    actionSubtitle: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    arrowBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    }
});