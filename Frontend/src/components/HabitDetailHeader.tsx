import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Crisp Architectural Palette
const BRAND_BLUE = "#0e0057";
const BRAND_AMBER = "#f59e0b";
const EMERALD_GREEN = "#059669";
const ERROR_RED = "#ef4444";
const MUTED_SLATE = "#94a3b8";
const TEXT_CARBON = "#1e293b";

interface HeaderProps {
    title: string;
    category: string;
    streak: number;
    frequency: string;
    color?: string;
    status: 'Upcoming' | 'Active' | 'Expired';
    onEdit?: () => void;
}

export const HabitDetailHeader: React.FC<HeaderProps> = ({
    title,
    category,
    streak,
    frequency,
    color,
    status,
    onEdit
}) => {
    const activeColor = color || BRAND_BLUE;

    // 🎨 Determine Status configuration based strictly on Date Lifecycle
    const getStatusConfig = () => {
        switch (status) {
            case 'Upcoming':
                return { label: 'WAITING TO START', color: BRAND_AMBER };
            case 'Expired':
                return { label: 'RITUAL EXPIRED', color: ERROR_RED };
            default:
                return { label: 'ACTIVE RITUAL', color: EMERALD_GREEN };
        }
    };

    const statusInfo = getStatusConfig();

    return (
        <View style={styles.outerContainer}>
            {/* Floating Category Badge */}
            <View style={[styles.jewelBadge, { backgroundColor: activeColor }]}>
                <Text style={styles.jewelText}>{category.toUpperCase()}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.mainInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>

                        {/* 🔹 Integrated Edit Button */}
                        <TouchableOpacity onPress={onEdit} style={styles.editBtn} activeOpacity={0.7}>
                            <Ionicons name="create-outline" size={18} color={MUTED_SLATE} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.metaRow}>
                        {/* Frequency Badge */}
                        <View style={[styles.freqBadge, { borderColor: activeColor + '40', backgroundColor: activeColor + '10' }]}>
                            <Text style={[styles.freqText, { color: activeColor }]}>{frequency?.toUpperCase()}</Text>
                        </View>

                        {/* Date Lifecycle Status */}
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            • {statusInfo.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 🔹 Calculated Streak Column with updated sizes and colors */}
                <View style={styles.streakColumn}>
                    <Text style={[styles.streakValue, { color: streak > 0 ? BRAND_BLUE : '#cbd5e1' }]}>
                        {streak}
                    </Text>
                    <View style={styles.streakIconRow}>
                        <Ionicons
                            name="flame"
                            size={20}
                            color={streak > 0 ? BRAND_AMBER : '#e2e8f0'}
                        />
                        <Text style={styles.streakUnit}>DAYS</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        marginHorizontal: 16,
        marginTop: 12,
    },
    jewelBadge: {
        position: 'absolute',
        top: -12,
        left: 20,
        zIndex: 10,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    jewelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#f1f5f9",
        elevation: 3,
        shadowColor: BRAND_BLUE,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: "900",
        color: BRAND_BLUE,
        marginBottom: 8,
        letterSpacing: -0.5,
        flex: 1
    },
    editBtn: {
        padding: 4,
        marginLeft: 8
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    freqBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1.5
    },
    freqText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5
    },
    divider: {
        width: 1,
        height: '70%',
        backgroundColor: '#f1f5f9',
        marginHorizontal: 15
    },
    streakColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 55
    },
    streakValue: {
        fontSize: 26,
        fontWeight: '900',
        lineHeight: 30
    },
    streakIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 2
    },
    streakUnit: {
        fontSize: 10,
        fontWeight: '900',
        color: '#0751ac',
        letterSpacing: 1
    },
});