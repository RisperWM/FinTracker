import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ViewStyle,
    TextStyle,
} from 'react-native';
import {
    format,
    isToday,
    startOfDay,
    isAfter,
    isBefore,
} from 'date-fns';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 80) / 7;

const FOREST_GREEN = '#096437';
const OCHRE_AMBER = '#e46708';
const SKIPPED_SLATE = '#64748b';
const TODAY_GOLD = '#f59e0b';
const TEXT_MAIN = '#0f172a';
const TEXT_MUTED = '#0e1935ff';

interface DailyCalendarProps {
    calendarDays: Date[];
    logs: any[];
    onLogPress: (day: Date) => void;
    today: Date;
    startLimit: Date;
}

export const DailyCalendar: React.FC<DailyCalendarProps> = ({
    calendarDays,
    logs,
    onLogPress,
    today,
    startLimit,
}) => {
    return (
        <View style={styles.mainCard}>
            <View style={styles.cardInfo}>
                <View style={styles.weekRow}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <Text key={i} style={styles.weekText}>{d}</Text>
                    ))}
                </View>
            </View>

            <View style={styles.grid}>
                {calendarDays.map((day, i) => {
                    const dStr = format(day, 'yyyy-MM-dd');
                    const log = (logs || []).find(l => (l.date || "").split('T')[0] === dStr);
                    const isInteractable = !isAfter(startOfDay(day), today) && !isBefore(startOfDay(day), startLimit);

                    const circleStyle: ViewStyle[] = [styles.dayCircle];
                    const textStyle: TextStyle[] = [styles.dayText];

                    if (log?.status === 'Completed') {
                        circleStyle.push({ backgroundColor: FOREST_GREEN });
                        textStyle.push({ color: '#fff' });
                    } else if (log?.status === 'Failed') {
                        circleStyle.push({ backgroundColor: OCHRE_AMBER });
                        textStyle.push({ color: '#fff' });
                    } else if (log?.status === 'Skipped') {
                        circleStyle.push({ backgroundColor: SKIPPED_SLATE });
                        textStyle.push({ color: '#fff' });
                    } else if (isToday(day)) {
                        circleStyle.push({ borderWidth: 1.5, borderColor: TODAY_GOLD, backgroundColor: '#fff' });
                        textStyle.push({ color: TODAY_GOLD, fontWeight: '900' });
                    }

                    if (!isInteractable) circleStyle.push({ opacity: 0.35 });

                    return (
                        <TouchableOpacity
                            key={`${dStr}-${i}`}
                            style={circleStyle}
                            disabled={!isInteractable}
                            onPress={() => onLogPress(day)}
                        >
                            <Text style={textStyle}>{format(day, 'd')}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: FOREST_GREEN }]} />
                    <Text style={styles.legendLabel}>Done</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: SKIPPED_SLATE }]} />
                    <Text style={styles.legendLabel}>Skip</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: OCHRE_AMBER }]} />
                    <Text style={styles.legendLabel}>Miss</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainCard: {
        backgroundColor: '#fff',
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 24,
        paddingTop: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 3
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        paddingBottom: 8
    },
    weekRow: { flexDirection: 'row', gap: 12 },
    weekText: { width: TILE_SIZE - 12, textAlign: 'center', fontSize: 12, fontWeight: '700', color: TEXT_MUTED },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    dayCircle: {
        width: TILE_SIZE - 6,
        height: TILE_SIZE - 6,
        borderRadius: (TILE_SIZE - 6) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#fafafa'
    },
    dayText: { fontSize: 13, fontWeight: '600', color: TEXT_MAIN },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 10,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendLabel: { fontSize: 10, fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase' },
});