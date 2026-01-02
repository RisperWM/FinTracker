import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, startOfMonth, endOfMonth, isAfter, isBefore, isSameMonth, parseISO } from 'date-fns';

const DEEP_NAVY = '#0e0057';

interface HabitLog {
    date: string;
    status: 'Completed' | 'Skipped' | 'Failed';
}

interface MonthlyCalendarProps {
    months: Date[];
    logs: HabitLog[];
    onLogPress: (month: Date) => void;
    today: Date;
    startLimit: Date;
    colors: {
        FOREST_GREEN: string;
        OCHRE_AMBER: string;
        SKIPPED_SLATE: string;
    };
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
    months,
    logs,
    onLogPress,
    today,
    startLimit,
    colors
}) => {
    return (
        <View style={styles.mainContainer}>
            <View style={styles.monthlyGrid}>
                {months.map((month, idx) => {
                    const log = (logs || []).find((l: HabitLog) => isSameMonth(parseISO(l.date), month));
                    const isInteractable = !isAfter(startOfMonth(month), today) && !isBefore(endOfMonth(month), startLimit);
                    const isLogged = !!log;

                    let bgColor = '#FFFFFF';
                    if (log?.status === 'Completed') bgColor = colors.FOREST_GREEN;
                    else if (log?.status === 'Failed') bgColor = colors.OCHRE_AMBER;
                    else if (log?.status === 'Skipped') bgColor = colors.SKIPPED_SLATE;

                    return (
                        <TouchableOpacity
                            key={idx}
                            activeOpacity={0.8}
                            style={[
                                styles.miniCalendar,
                                { backgroundColor: bgColor },
                                isLogged && { borderColor: 'transparent' },
                                !isInteractable && { opacity: 0.4 }
                            ]}
                            disabled={!isInteractable}
                            onPress={() => onLogPress(month)}
                        >
                            {/* 🗓️ TOP BINDER SECTION */}
                            <View style={[
                                styles.calendarHeader,
                                isLogged && { backgroundColor: 'rgba(0,0,0,0.15)' }
                            ]}>
                                <View style={styles.binderDots}>
                                    <View style={[styles.dot, isLogged && { backgroundColor: '#fff' }]} />
                                    <View style={[styles.dot, isLogged && { backgroundColor: '#fff' }]} />
                                </View>
                            </View>

                            <View style={styles.calendarBody}>
                                <Text style={[
                                    styles.monthLabel,
                                    isLogged ? { color: '#fff' } : { color: DEEP_NAVY }
                                ]}>
                                    {format(month, 'MMM').toUpperCase()}
                                </Text>
                                <Text style={[
                                    styles.yearLabel,
                                    isLogged ? { color: 'rgba(255,255,255,0.7)' } : { color: '#94a3b8' }
                                ]}>
                                    {format(month, 'yyyy')}
                                </Text>
                            </View>

                            {isLogged && <View style={styles.whiteDash} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#fff',
        padding: 8,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 1150,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    monthlyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', 
        columnGap: 11,
        rowGap: 10,
    },
    miniCalendar: {
        flexBasis: '30%',
        height: 90,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    calendarHeader: {
        height: 20,
        backgroundColor: DEEP_NAVY,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    binderDots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    calendarBody: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
    },
    monthLabel: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.2,
    },
    yearLabel: {
        fontSize: 9,
        fontWeight: '700',
        marginTop: -1,
    },
    whiteDash: {
        width: 12,
        height: 2,
        backgroundColor: '#fff',
        borderRadius: 1,
        position: 'absolute',
        bottom: 6,
        alignSelf: 'center',
    }
});