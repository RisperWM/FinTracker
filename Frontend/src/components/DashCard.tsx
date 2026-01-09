import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { AddTransactionPopup } from "@/src/components/addTransaction";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");
const CARD_HEIGHT = width * 0.50;

const DashCard = () => {
    const [showBalance, setShowBalance] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    const {
        totalBalance,
        totalLoans,
        totalDebts,
        getTotalBalance,
        loading,
        transactions
    } = useTransactionStore();

    const user = useAuthStore((state) => state.user);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 1200, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ])
        ).start();

        if (user?._id) getTotalBalance();
    }, [user?._id, transactions]);

    return (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={require("@/assets/images/card-bg.jpg")}
                style={styles.imageBg}
                imageStyle={{ borderRadius: 24 }}
            >
                <LinearGradient
                    colors={['rgba(14, 0, 87, 0.92)', 'rgba(10, 0, 60, 0.85)']}
                    style={styles.overlay}
                >
                    <View style={styles.content}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <View style={styles.statusGroup}>
                                <View style={styles.dotContainer}>
                                    <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
                                    <View style={styles.mainDot} />
                                </View>
                                <Text style={styles.statusText}>ACTIVE VAULT</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                                <Ionicons
                                    name={showBalance ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="rgba(255,255,255,0.5)"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* 🔹 Main Body: Split View */}
                        <View style={styles.mainBody}>
                            {/* Left Side: Balance Area */}
                            <View style={styles.balanceArea}>
                                <Text style={styles.label}>AVAILABLE BALANCE</Text>
                                <View style={styles.amountRow}>
                                    <Text style={styles.currency}>KES</Text>
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#f59e0b" />
                                    ) : (
                                        <Text style={styles.amount} numberOfLines={1}>
                                            {showBalance ? Number(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 0 }) : "••••••"}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Right Side: Vertical Exposure Stats */}
                            <View style={styles.exposureColumn}>
                                <View style={styles.statPill}>
                                    <View style={[styles.indicator, { backgroundColor: '#10b981' }]} />
                                    <View>
                                        <Text style={styles.statLabel}>OUT (LOANS)</Text>
                                        <Text style={styles.statValue}>
                                            {showBalance ? Number(totalLoans).toLocaleString() : "•••"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.statPill}>
                                    <View style={[styles.indicator, { backgroundColor: '#ef4444' }]} />
                                    <View>
                                        <Text style={styles.statLabel}>OWED (DEBTS)</Text>
                                        <Text style={styles.statValue}>
                                            {showBalance ? Number(totalDebts).toLocaleString() : "•••"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Footer Section */}
                        <View style={styles.footer}>
                            <View style={styles.userInfo}>
                                <Ionicons name="person-circle-outline" size={16} color="rgba(255,255,255,0.4)" />
                                <Text style={styles.userName}>
                                    {user ? `${user.firstname} ${user.surname}` : "Guest User"}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setShowPopup(true)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['#f59e0b', '#d97706']}
                                    style={styles.gradientBtn}
                                >
                                    <Ionicons name="add" size={24} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>

            <AddTransactionPopup visible={showPopup} onClose={() => setShowPopup(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginHorizontal: 16,
        height: CARD_HEIGHT,
        borderRadius: 24,
        elevation: 15,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
    },
    imageBg: { flex: 1, borderRadius: 24 },
    overlay: { flex: 1, borderRadius: 24, padding: 20 },
    content: { flex: 1, justifyContent: 'space-between' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusGroup: { flexDirection: 'row', alignItems: 'center' },
    dotContainer: { width: 12, height: 12, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    mainDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
    pulseDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', opacity: 0.4 },
    statusText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

    mainBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    balanceArea: { flex: 1.2 },
    label: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    amountRow: { flexDirection: 'row', alignItems: 'baseline' },
    currency: { color: '#f59e0b', fontSize: 14, fontWeight: '700', marginRight: 4 },
    amount: { color: '#fff', fontSize: 28, fontWeight: '500' },

    exposureColumn: { flex: 0.8, gap: 8, alignItems: 'flex-end' },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    indicator: { width: 3, height: 14, borderRadius: 2, marginRight: 8 },
    statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: '800' },
    statValue: { color: '#fff', fontSize: 11, fontWeight: '700' },

    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userName: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    gradientBtn: { width: 38, height: 35, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }
});

export default DashCard;