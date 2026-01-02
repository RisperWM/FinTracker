import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, startOfWeek, endOfWeek, isAfter, isBefore, isSameWeek, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const TEXT_MAIN = '#0f172a';
const DEEP_NAVY = '#0e0057';
const ACTION_AMBER = '#f59e0b';

interface HabitLog {
    date: string;
    status: 'Completed' | 'Skipped' | 'Failed';
}

interface WeeklyCalendarProps {
    weeks: Date[];
    logs: HabitLog[];
    onLogPress: (weekStart: Date) => void;
    today: Date;
    startLimit: Date;
    colors: {
        FOREST_GREEN: string;
        OCHRE_AMBER: string;
        SKIPPED_SLATE: string;
    };
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    weeks,
    logs,
    onLogPress,
    today,
    startLimit,
    colors
}) => {
    return (
        <View style={styles.outerWrapper}>
            <View style={styles.weeklyList}>
                {weeks.map((weekStart, idx) => {
                    const log = (logs || []).find((l: HabitLog) => isSameWeek(parseISO(l.date), weekStart));
                    const endOfWk = endOfWeek(weekStart);
                    const isInteractable = !isAfter(startOfWeek(weekStart), today) && !isBefore(endOfWk, startLimit);

                    // 🎨 Dynamic Status Logic
                    let statusLabel = "Pending log";
                    let statusColor = ACTION_AMBER;
                    let bgColor = '#FFFFFF';

                    if (log?.status === 'Completed') {
                        statusLabel = "Logged";
                        statusColor = colors.FOREST_GREEN;
                        bgColor = colors.FOREST_GREEN;
                    } else if (log?.status === 'Skipped') {
                        statusLabel = "Skipped";
                        statusColor = colors.SKIPPED_SLATE;
                        bgColor = colors.SKIPPED_SLATE;
                    } else if (log?.status === 'Failed') {
                        statusLabel = "Missed";
                        statusColor = colors.OCHRE_AMBER;
                        bgColor = colors.OCHRE_AMBER;
                    } else if (!isInteractable) {
                        statusLabel = "Locked";
                        statusColor = '#94a3b8';
                    }

                    const isLogged = !!log;

                    return (
                        <TouchableOpacity
                            key={idx}
                            activeOpacity={0.8}
                            style={[
                                styles.weekStrip,
                                { backgroundColor: bgColor },
                                isLogged && { borderColor: 'transparent' },
                                !isInteractable && { opacity: 0.6 }
                            ]}
                            disabled={!isInteractable}
                            onPress={() => onLogPress(weekStart)}
                        >
                            {/* 🟦 NAVY CALENDAR ICON */}
                            <View style={styles.iconContainer}>
                                <View style={styles.calendarIcon}>
                                    <View style={styles.iconBinder}>
                                        <View style={styles.binderRing} />
                                        <View style={styles.binderRing} />
                                    </View>
                                    <View style={styles.iconBody}>
                                        <Text style={styles.wkNumber}>{idx + 1}</Text>
                                        <Text style={styles.wkLabel}>WEEK</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.contentContainer}>
                                <View style={styles.textDetails}>
                                    <Text style={[styles.dateRangeText, isLogged && { color: '#fff' }]}>
                                        {format(weekStart, "do MMM")} — {format(endOfWk, "do MMM")}
                                    </Text>
                                    <Text style={[styles.currentDay, isLogged && { color: 'rgba(255,255,255,0.7)' }]}>
                                        {format(today, 'EEEE')}
                                    </Text>
                                    <Text style={[
                                        styles.statusText,
                                        { color: isLogged ? '#fff' : statusColor }
                                    ]}>
                                        {statusLabel}
                                    </Text>
                                </View>

                                {/* ➕ DYNAMIC ACTION BUTTON */}
                                <View style={[
                                    styles.actionButton,
                                    isLogged ? { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: '#fff' }
                                        : { borderColor: isInteractable ? DEEP_NAVY : '#CBD5E1' }
                                ]}>
                                    <Ionicons
                                        name={isLogged ? "checkmark" : "add"}
                                        size={22}
                                        color={isLogged ? "#fff" : (isInteractable ? ACTION_AMBER : '#CBD5E1')}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerWrapper: {
        backgroundColor: '#fff',
        paddingLeft: 24,
        paddingTop: 10,
        paddingRight: 16,
        paddingBottom: 10,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    weeklyList: { gap: 16 },
    weekStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 80,
        paddingRight: 16,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        position: 'absolute',
        left: -24,
        zIndex: 10,
    },
    calendarIcon: {
        width: 46,
        height: 50,
        backgroundColor: DEEP_NAVY,
        borderRadius: 10,
        paddingTop: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconBinder: {
        position: 'absolute',
        top: -6,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 8,
    },
    binderRing: {
        width: 6,
        height: 12,
        backgroundColor: '#cbd5e1',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#94a3b8',
    },
    iconBody: { alignItems: 'center', justifyContent: 'center' },
    wkLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    wkNumber: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 38,
    },
    textDetails: { flex: 1 },
    dateRangeText: {
        fontSize: 15,
        fontWeight: '700',
        color: DEEP_NAVY,
    },
    currentDay: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 0.8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});