import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/store/habitStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitDetailHeader } from '@/components/HabitDetailHeader';
import { HabitLogCalendar } from '@/components/HabitLog';
import {
  startOfDay, parseISO, isBefore, isAfter, isToday, isSameDay,
  subDays, differenceInDays, differenceInWeeks, differenceInMonths
} from 'date-fns';

const TEXT_CARBON = "#1e293b";
const MUTED_SLATE = "#94a3b8";
const CRISP_GREEN = "#02442eff";
const CRISP_AMBER = "#b3750aff";
const CRISP_RED = "#5a0f1bff";
const CRISP_PURPLE = "#2a0f69ff";

const HABIT_MESSAGES = [
  "Small wins every day lead to big results.",
  "Consistency is the key to mastery.",
  "Trust the process, one day at a time.",
  "Habits are the compound interest of self-improvement.",
  "Your future is hidden in your daily routine.",
  "Don't break the chain.",
  "Action creates motivation.",
  "Focus on the systems, not just the goals.",
  "Discipline over inspiration.",
  "Identity is built through daily repetition."
];

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const habit = useHabitStore((state) => state.habits.find(h => h._id === id));
  const allLogs = useHabitStore((state) => state.logs);
  const fetchHabits = useHabitStore((state) => state.fetchHabits);
  const fetchLogs = useHabitStore((state) => state.fetchLogs);

  useEffect(() => {
    if (id) {
      if (!habit) fetchHabits();
      if (!allLogs[id]) fetchLogs(id);
    }
  }, [id]);

  const habitLogs = useMemo(() => {
    const data = id ? allLogs[id] : [];
    return Array.isArray(data) ? data : [];
  }, [allLogs, id]);

  const journey = useMemo(() => {
    if (!habit) return { current: 0, total: 0, label: 'DAY' };
    const start = startOfDay(parseISO(habit.startDate));
    const end = habit.endDate ? startOfDay(parseISO(habit.endDate)) : null;
    const today = startOfDay(new Date());

    let current = differenceInDays(today, start) + 1;
    let total = end ? differenceInDays(end, start) + 1 : 0;

    if (habit.frequency === 'Weekly') {
      current = differenceInWeeks(today, start) + 1;
      total = end ? differenceInWeeks(end, start) + 1 : 0;
    } else if (habit.frequency === 'Monthly') {
      current = differenceInMonths(today, start) + 1;
      total = end ? differenceInMonths(end, start) + 1 : 0;
    }

    const label = habit.frequency === 'Daily' ? 'DAY' : habit.frequency === 'Weekly' ? 'WEEK' : 'MONTH';
    return { current: Math.max(0, current), total: Math.max(0, total), label };
  }, [habit]);

  const stats = useMemo(() => {
    const completed = habitLogs.filter(l => l.status === 'Completed').length;
    const skipped = habitLogs.filter(l => l.status === 'Skipped').length;
    const failed = habitLogs.filter(l => l.status === 'Failed').length;
    const notLogged = Math.max(0, journey.current - habitLogs.length);
    return { completed, skipped, failed, notLogged };
  }, [habitLogs, journey]);

  const ritualStatus = useMemo(() => {
    if (!habit) return 'Active';
    const today = startOfDay(new Date());
    const start = startOfDay(parseISO(habit.startDate));
    const end = habit.endDate ? startOfDay(parseISO(habit.endDate)) : null;
    if (isBefore(today, start)) return 'Upcoming';
    if (end && isAfter(today, end)) return 'Expired';
    return 'Active';
  }, [habit]);

  const currentStreak = useMemo(() => {
    if (habitLogs.length === 0) return 0;
    const completedLogs = habitLogs.filter(l => l.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let checkDate = startOfDay(new Date());
    if (!completedLogs.find(l => isToday(parseISO(l.date)))) checkDate = subDays(checkDate, 1);
    for (let i = 0; i < 365; i++) {
      const found = completedLogs.find(l => isSameDay(parseISO(l.date), checkDate));
      if (found) { streak++; checkDate = subDays(checkDate, 1); } else break;
    }
    return streak;
  }, [habitLogs]);

  const handleEdit = () => {
    router.push({
      pathname: "/habit/create",
      params: { id: habit?._id, mode: 'edit' }
    });
  };

  if (!habit) return <View style={styles.loader}><ActivityIndicator color={TEXT_CARBON} /></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
          <Ionicons name="arrow-back" size={24} color={TEXT_CARBON} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>HABIT ARCHIVE</Text>
        <TouchableOpacity style={styles.navIcon} onPress={handleEdit}>
          <Ionicons name="options-outline" size={20} color={MUTED_SLATE} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HabitDetailHeader
          title={habit.title}
          category={habit.category}
          frequency={habit.frequency}
          streak={currentStreak}
          color={habit.color}
          status={ritualStatus}
          onEdit={handleEdit}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HABIT JOURNEY</Text>
          <View style={[styles.journeyCard, { backgroundColor: habit.color }]}>
            <View style={styles.journeyContent}>
              <View style={styles.journeyMainRow}>
                <Text style={styles.journeyPrimaryText}>{journey.label} {journey.current}</Text>
                <Text style={styles.journeySeparator}>/</Text>
                <Text style={styles.journeyTotalText}>{journey.total > 0 ? journey.total : '∞'}</Text>
              </View>
              <Text style={styles.journeyDesc}>{HABIT_MESSAGES[journey.current % HABIT_MESSAGES.length]}</Text>
            </View>
            <View style={styles.badgeIcon}>
              <Ionicons name="medal-outline" size={24} color="#fff" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVITY LOG</Text>
          <HabitLogCalendar
            habitId={habit._id}
            logs={habitLogs}
            color={habit.color}
            frequency={habit.frequency}
            startDate={habit.startDate}
            endDate={habit.endDate}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HABIT PERFORMANCE</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.perfTile, { backgroundColor: CRISP_GREEN }]}>
              <Ionicons name="checkmark-sharp" size={14} color="#fff" />
              <Text style={styles.perfVal}>{stats.completed}</Text>
              <Text style={styles.perfLab}>DONE</Text>
            </View>
            <View style={[styles.perfTile, { backgroundColor: CRISP_AMBER }]}>
              <Ionicons name="play-forward-sharp" size={14} color="#fff" />
              <Text style={styles.perfVal}>{stats.skipped}</Text>
              <Text style={styles.perfLab}>SKIP</Text>
            </View>
            <View style={[styles.perfTile, { backgroundColor: CRISP_RED }]}>
              <Ionicons name="close-sharp" size={14} color="#fff" />
              <Text style={styles.perfVal}>{stats.failed}</Text>
              <Text style={styles.perfLab}>MISS</Text>
            </View>
            <View style={[styles.perfTile, { backgroundColor: CRISP_PURPLE }]}>
              <Ionicons name="eye-off-sharp" size={14} color="#fff" />
              <Text style={styles.perfVal}>{stats.notLogged}</Text>
              <Text style={styles.perfLab}>VOID</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 6 },
  navIcon: { padding: 4 },
  navTitle: { fontSize: 9, fontWeight: '900', color: MUTED_SLATE, letterSpacing: 2 },
  scrollContent: { paddingBottom: 60 },
  section: { paddingHorizontal: 16, marginTop: 15 },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: MUTED_SLATE, marginBottom: 10, letterSpacing: 1.5, paddingLeft: 4 },
  journeyCard: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  journeyContent: { flex: 1 },
  journeyMainRow: { flexDirection: 'row', alignItems: 'baseline' },
  journeyPrimaryText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  journeySeparator: { color: 'rgba(255,255,255,0.4)', fontSize: 18, marginHorizontal: 6, fontWeight: '300' },
  journeyTotalText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700' },
  journeyDesc: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 4, opacity: 0.9 },
  badgeIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 8 },
  perfTile: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
  perfVal: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 2 },
  perfLab: { fontSize: 7, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.8 }
});