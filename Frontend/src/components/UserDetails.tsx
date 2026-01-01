import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Modal,
    Pressable,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get("window");

const UserDetails = () => {
    const { user, logout } = useAuthStore();
    const [menuVisible, setMenuVisible] = useState(false);

    const firstname = user?.firstname || 'Guest';
    const surname = user?.surname || 'User';
    const initials = `${firstname[0]}${surname[0]}`.toUpperCase();

    const today = new Date();
    const day = today.toLocaleDateString('en-US', { weekday: 'long' });
    const date = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Header Left */}
                <View style={styles.leftSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                        <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.textContainer}>
                        <Text style={styles.dayText}>{day.toUpperCase()}, {date.toUpperCase()}</Text>
                        <Text style={styles.userName} numberOfLines={1}>{firstname} {surname}</Text>
                    </View>
                </View>

                {/* Header Right */}
                <View style={styles.rightSection}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="notifications-outline" size={22} color="#0e0057" />
                        <View style={styles.accentDot} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconBtn, { marginLeft: 16 }]}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Ionicons name="menu-outline" size={28} color="#0e0057" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔹 Attractive Custom Popup */}
            <Modal visible={menuVisible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.menuCard}>
                        {/* Header of Popup */}
                        <View style={styles.menuProfileHeader}>
                            <View style={[styles.avatar, { backgroundColor: '#0e0057' }]}>
                                <Text style={[styles.avatarText, { color: '#f59e0b' }]}>{initials}</Text>
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.menuName}>{firstname} {surname}</Text>
                                <Text style={styles.menuSubtext}>Premium Member</Text>
                            </View>
                        </View>

                        <View style={styles.menuContent}>
                            <TouchableOpacity style={styles.attractiveItem}>
                                <View style={[styles.iconBox, { backgroundColor: '#f0f0ff' }]}>
                                    <Ionicons name="person" size={18} color="#0e0057" />
                                </View>
                                <Text style={styles.itemLabel}>Profile Details</Text>
                                <Ionicons name="chevron-forward" size={16} color="#ccc" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.attractiveItem}>
                                <View style={[styles.iconBox, { backgroundColor: '#fff7e6' }]}>
                                    <Ionicons name="shield-checkmark" size={18} color="#f59e0b" />
                                </View>
                                <Text style={styles.itemLabel}>Security</Text>
                                <Ionicons name="chevron-forward" size={16} color="#ccc" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.attractiveItem}>
                                <View style={[styles.iconBox, { backgroundColor: '#eefcf5' }]}>
                                    <Ionicons name="settings" size={18} color="#10b981" />
                                </View>
                                <Text style={styles.itemLabel}>Settings</Text>
                                <Ionicons name="chevron-forward" size={16} color="#ccc" />
                            </TouchableOpacity>

                            <View style={styles.lineDivider} />

                            <TouchableOpacity
                                style={[styles.attractiveItem, styles.logoutMargin]}
                                onPress={() => { setMenuVisible(false); logout(); }}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#fff5f5' }]}>
                                    <Ionicons name="log-out" size={18} color="#FF3B30" />
                                </View>
                                <Text style={[styles.itemLabel, { color: '#FF3B30' }]}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: '#fcfcfc',
        borderBottomWidth: 1,
        borderBottomColor: "#dcd7f5ff",
    },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    leftSection: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#f59e0b', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#0e0057', fontSize: 16, fontWeight: '800' },
    onlineDot: {
        position: 'absolute', top: -2, right: -2, width: 11, height: 11,
        borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fcfcfc',
    },
    divider: { width: 1, height: 26, backgroundColor: '#e2e8f0', marginHorizontal: 15 },
    textContainer: { justifyContent: 'center' },
    dayText: { fontSize: 9, color: '#94a3b8', fontWeight: '800', letterSpacing: 1.2 },
    userName: { fontSize: 17, fontWeight: '600', color: '#0e0057' },
    rightSection: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { position: 'relative' },
    accentDot: {
        position: 'absolute', top: 0, right: 0, width: 7, height: 7,
        borderRadius: 4, backgroundColor: '#f59e0b', borderWidth: 1.5, borderColor: '#fcfcfc',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(14, 0, 87, 0.15)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuCard: {
        marginTop: 65,
        marginRight: 20,
        width: width * 0.65,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
            android: { elevation: 15 },
        }),
    },
    menuProfileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 8,
    },
    menuName: { fontSize: 15, fontWeight: '800', color: '#0e0057' },
    menuSubtext: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    menuContent: { marginTop: 8 },
    attractiveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#334155' },
    lineDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
    logoutMargin: { marginTop: 4 },
});

export default UserDetails;