import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

const UserDetails = () => {
    const { user, logout } = useAuthStore();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogout = () => {
        setMenuVisible(false);
        logout();
    };

    return (
        <View style={styles.container}>
            {/* User Details */}
            <View style={styles.userDetails}>
                {/* Left: User Icon + Name */}
                <View style={styles.userInfo}>
                    <Ionicons name="person-circle" size={50} color="#e68a13ea" />
                    <View style={styles.userTextContainer}>
                        <Text style={styles.helloTxt}>Hello!</Text>
                        <Text style={styles.userName}>
                            {user ? `${user.firstname} ${user.surname}` : 'Guest User'}
                        </Text>
                    </View>
                </View>

                {/* Right: Notification Icon */}
                <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                    <Ionicons name="notifications-outline" size={28} color="#0e0057" />
                </TouchableOpacity>
            </View>

            {/* Logout Popup */}
            {menuVisible && (
                <View style={styles.popupContainer}>
                    <TouchableOpacity onPress={handleLogout} style={styles.popupButton}>
                        <Ionicons name="log-out-outline" size={18} color="#fff" />
                        <Text style={styles.popupText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default UserDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        zIndex:100000
    },
    userDetails: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    userTextContainer: {
        marginLeft: 5,
    },
    helloTxt: {
        fontSize: 14,
        color: "#504f4fff",
        fontWeight: "500",
    },
    userName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0e0057",
    },
    popupContainer: {
        position: "absolute",
        top: 55,
        right: 10,
        backgroundColor: "#0e0057",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    popupButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },
    popupText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "600",
        fontSize: 14,
    },
});
