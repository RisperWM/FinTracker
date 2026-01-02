import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addMonths,
    subMonths,
    startOfDay,
    parseISO,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    startOfYear,
    endOfYear,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHabitStore } from '@/store/habitStore';

// Import your standalone UI components
import { DailyCalendar } from './DailyCalendar';
import { WeeklyCalendar } from './WeeklyCalendar';
import { MonthlyCalendar } from './MonthlyCalendar';

const { width } = Dimensions.get('window');

/* 🎨 REFINED COLOR SYSTEM */
const FOREST_GREEN = '#096437';
const OCHRE_AMBER = '#e46708';
const SKIPPED_SLATE = '#64748b';
const TODAY_GOLD = '#f59e0b';
const TEXT_MAIN = '#0f172a';
const TEXT_MUTED = '#0e1935ff';
const MAX_COMMENT_LENGTH = 50;

interface CalendarProps {
    habitId: string;
    logs: any[];
    color?: string;
    startDate?: string;
    endDate?: string;
    frequency?: 'Daily' | 'Weekly' | 'Monthly';
}

type StatusType = 'Completed' | 'Skipped' | 'Failed';

export const HabitLogCalendar: React.FC<CalendarProps> = ({
    habitId,
    logs,
    color = '#1e293b',
    startDate,
    endDate,
    frequency = 'Daily',
}) => {
    const saveLog = useHabitStore((s) => s.saveLog);

    const [viewDate, setViewDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState<StatusType>('Completed');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = startOfDay(new Date());
    const startLimit = useMemo(() => (startDate ? startOfDay(parseISO(startDate)) : today), [startDate]);

    const onLogPress = (day: Date) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedDay(day);

        const dStr = format(day, 'yyyy-MM-dd');
        const existingLog = (logs || []).find(l => (l.date || "").split('T')[0] === dStr);

        setComment(existingLog?.comment || '');
        setStatus(existingLog?.status || 'Completed');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!selectedDay) return;
        setIsSubmitting(true);

        try {
            await saveLog({
                habitId,
                date: format(selectedDay, 'yyyy-MM-dd'),
                status,
                comment: comment.trim(),
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", "Failed to save log.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!startDate || !endDate) return <ActivityIndicator color={color} style={{ margin: 40 }} />;

    return (
        <View style={styles.outerContainer}>
            <View style={styles.headerTabContainer}>
                <View style={[styles.tab, { backgroundColor: color }]}>
                    <Text style={styles.tabText}>
                        {frequency === 'Monthly'
                            ? format(viewDate, 'yyyy')
                            : format(viewDate, 'MMMM yyyy').toUpperCase()}
                    </Text>
                </View>
                <View style={styles.navGroup}>
                    <TouchableOpacity
                        onPress={() => setViewDate(subMonths(viewDate, frequency === 'Monthly' ? 12 : 1))}
                        style={styles.navBtn}
                    >
                        <Ionicons name="chevron-back" size={16} color={'#fff'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewDate(addMonths(viewDate, frequency === 'Monthly' ? 12 : 1))}
                        style={styles.navBtn}
                    >
                        <Ionicons name="chevron-forward" size={16} color={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔹 DYNAMIC CALENDAR RENDERER */}
            {frequency === 'Daily' && (
                <DailyCalendar
                    calendarDays={useMemo(() => eachDayOfInterval({
                        start: startOfWeek(startOfMonth(viewDate)),
                        end: endOfWeek(endOfMonth(viewDate)),
                    }), [viewDate])}
                    logs={logs}
                    onLogPress={onLogPress}
                    today={today}
                    startLimit={startLimit}
                />
            )}

            {frequency === 'Weekly' && (
                <WeeklyCalendar
                    weeks={useMemo(() => eachWeekOfInterval({
                        start: startOfMonth(viewDate),
                        end: endOfMonth(viewDate),
                    }), [viewDate])}
                    logs={logs}
                    onLogPress={onLogPress}
                    today={today}
                    startLimit={startLimit}
                    colors={{ FOREST_GREEN, OCHRE_AMBER, SKIPPED_SLATE }}
                />
            )}

            {frequency === 'Monthly' && (
                <MonthlyCalendar
                    months={useMemo(() => eachMonthOfInterval({
                        start: startOfYear(viewDate),
                        end: endOfYear(viewDate),
                    }), [viewDate])}
                    logs={logs}
                    onLogPress={onLogPress}
                    today={today}
                    startLimit={startLimit}
                    colors={{ FOREST_GREEN, OCHRE_AMBER, SKIPPED_SLATE }}
                />
            )}

            <Modal animationType="fade" transparent={true} visible={modalVisible}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalYear}>{selectedDay ? format(selectedDay, 'yyyy') : ''}</Text>
                                <Text style={styles.modalTitle}>{selectedDay ? format(selectedDay, 'EEEE, MMM do') : ''}</Text>
                            </View>

                            <View style={[styles.togglerContainer, { borderColor: color + '20' }]}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, status === 'Completed' && { backgroundColor: color }]}
                                    onPress={() => { setStatus('Completed'); Haptics.selectionAsync(); }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={[styles.toggleText, status === 'Completed' && { color: '#fff' }]}>Done</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, status === 'Skipped' && { backgroundColor: color }]}
                                    onPress={() => { setStatus('Skipped'); Haptics.selectionAsync(); }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={[styles.toggleText, status === 'Skipped' && { color: '#fff' }]}>Skip</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, status === 'Failed' && { backgroundColor: color }]}
                                    onPress={() => { setStatus('Failed'); Haptics.selectionAsync(); }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={[styles.toggleText, status === 'Failed' && { color: '#fff' }]}>Miss</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.miniInput}
                                    placeholder="Brief note..."
                                    placeholderTextColor="#94a3b8"
                                    value={comment}
                                    onChangeText={setComment}
                                    editable={!isSubmitting}
                                    maxLength={MAX_COMMENT_LENGTH}
                                    returnKeyType="done"
                                />
                                <Text style={styles.charCounter}>{comment.length}/{MAX_COMMENT_LENGTH}</Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: color, opacity: isSubmitting ? 0.6 : 1 }]}
                                    onPress={handleSave}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={styles.cancelBtn}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelBtnText}>Discard</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: { marginHorizontal: 0, marginBottom: 20 },
    headerTabContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    tab: { paddingHorizontal: 25, paddingVertical: 8, borderTopLeftRadius: 16, borderTopRightRadius: 16, minWidth: 120, alignItems: 'center' },
    tabText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
    navGroup: { flexDirection: 'row', gap: 8, marginBottom: 2 },
    navBtn: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#e68a13', justifyContent: 'center', alignItems: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 18, width: '80%', maxWidth: 300, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    modalHeader: { alignItems: 'center', marginBottom: 14 },
    modalYear: { fontSize: 10, fontWeight: '800', color: SKIPPED_SLATE, letterSpacing: 1 },
    modalTitle: { fontSize: 15, fontWeight: '800', color: TEXT_MAIN },

    togglerContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 3, marginBottom: 12, width: '100%', borderWidth: 1 },
    toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: 'center' },
    toggleText: { fontSize: 11, fontWeight: '700', color: '#64748b' },

    inputWrapper: { width: '100%', marginBottom: 14 },
    miniInput: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, paddingRight: 40, fontSize: 13, color: TEXT_MAIN, borderWidth: 1, borderColor: '#e2e8f0' },
    charCounter: { position: 'absolute', right: 8, bottom: 10, fontSize: 8, fontWeight: '800', color: '#cbd5e1' },

    modalActions: { flexDirection: 'row', width: '100%', gap: 8 },
    saveBtn: { flex: 1.5, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    cancelBtn: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#f1f5f9' },
    cancelBtnText: { color: '#64748b', fontSize: 13, fontWeight: '700' }
});