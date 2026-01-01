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
const CARD_HEIGHT = width * 0.48; // Slightly taller for more "breathability"

const DashCard = () => {
    const [showBalance, setShowBalance] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const { totalBalance, getTotalBalance, loading, transactions } = useTransactionStore();
    const user = useAuthStore((state) => state.user);

    // Pulse Animation for the Live indicator
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
                {/* 🔹 Gradient Overlay to ensure text legibility over the image */}
                <LinearGradient
                    colors={['rgba(14, 0, 87, 0.85)', 'rgba(26, 10, 128, 0.75)']}
                    style={styles.overlay}
                >
                    <View style={styles.content}>
                        {/* Top Section */}
                        <View style={styles.row}>
                            <View style={styles.statusGroup}>
                                <View style={styles.dotContainer}>
                                    <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
                                    <View style={styles.mainDot} />
                                </View>
                                <Text style={styles.statusText}>SECURE VAULT</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowBalance(!showBalance)}
                                style={styles.visibilityBtn}
                            >
                                <Ionicons
                                    name={showBalance ? "eye-outline" : "eye-off-outline"}
                                    size={22}
                                    color="rgba(255,255,255,0.7)"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Middle Section: Centered for impact but keeping clean lines */}
                        <View style={styles.balanceSection}>
                            <Text style={styles.label}>TOTAL AVAILABLE BALANCE</Text>
                            <View style={styles.amountRow}>
                                <Text style={styles.currency}>KES</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#f59e0b" />
                                ) : (
                                    <Text style={styles.amount}>
                                        {showBalance ? Number(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "••••••"}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Bottom Section */}
                        <View style={styles.footer}>
                            <View>
                                <Text style={styles.userLabel}>ACCOUNT HOLDER</Text>
                                <Text style={styles.userName}>
                                    {user ? `${user.firstname} ${user.surname}` : "Guest User"}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowPopup(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={28} color="#fff" />
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
        borderRadius: 20,
        elevation: 12,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        backgroundColor: '#0e0057',
    },
    imageBg: {
        flex: 1,
        borderRadius: 20,
    },
    overlay: {
        flex: 1,
        borderRadius: 20,
        padding: 18,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dotContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    mainDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f59e0b',
    },
    pulseDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#f59e0b',
        opacity: 0.3,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    visibilityBtn: {
        padding: 3,
    },
    balanceSection: {
        marginTop: 3,
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        color: '#f59e0b',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    amount: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    userLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    userName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addButton: {
        backgroundColor: '#f59e0b',
        width: 40,
        height: 40,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#f59e0b',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        borderWidth: 2,
        borderColor: '#f59e0b',
    }
});

export default DashCard;