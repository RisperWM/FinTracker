import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Image, StyleSheet } from "react-native";
import { verifyPin } from "@/security/pin";
import { usePinStore } from "@/store/pinStore";
import { handleFailedAttempt, resetAttempts, isLockedOut } from "@/security/lockout";
import { router } from "expo-router";

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function UnlockScreen() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const { unlock } = usePinStore();

    // 🔹 Auto-submission logic
    useEffect(() => {
        if (pin.length === 4) {
            handleUnlock();
        }
    }, [pin]);

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setError(""); // Reset error when user starts typing again
            setPin(pin + num);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleUnlock = async () => {
        if (await isLockedOut()) {
            Alert.alert("Too many attempts", "Try again later.");
            return;
        }

        const valid = await verifyPin(pin);

        if (valid) {
            await resetAttempts();
            unlock();
            router.replace("/(tabs)"); // Main app
        } else {
            await handleFailedAttempt();
            setError("Incorrect PIN. Try again.");
            setPin("");
        }
    };

    const renderDots = (length: number) => {
        const dots = [];
        for (let i = 0; i < 4; i++) {
            dots.push(
                <View
                    key={i}
                    style={{
                        width: 12,
                        height: 12,
                        margin: 5,
                        borderRadius: 6,
                        backgroundColor: i < length ? "#0e0057" : "#ddd",
                    }}
                />
            );
        }
        return (
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10 }}>
                {dots}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f9f9f9", justifyContent:"center", padding: 30 }}>
            {/* 🔹 Logo added here */}
            <View style={{ alignItems: "center", }}>
                <Image
                    source={require("@/assets/images/icon.png")}
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                />
            </View>

            <View style={{ backgroundColor: "#f9f9f9", paddingVertical: 5, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>Welcome Back</Text>
                <Text style={{ fontSize: 14, color: "gray", marginBottom: 20 }}>Enter your pin</Text>

                {renderDots(pin.length)}

                {/* 🔹 Stable error container */}
                <View style={{ height: 25 }}>
                    {error ? <Text style={{ color: "red", fontSize: 13 }}>{error}</Text> : null}
                </View>

                {/* Numeric keypad */}
                <View style={{ width: "100%", flexWrap: "wrap", flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                    {NUMBERS.map((num) => (
                        <TouchableOpacity
                            key={num}
                            onPress={() => handleNumberPress(num)}
                            style={{
                                width: 60,
                                height: 60,
                                margin: 8,
                                borderRadius: 30,
                                backgroundColor: "#ccc",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#000", fontSize: 22 }}>{num}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Backspace button */}
                    <TouchableOpacity
                        onPress={handleBackspace}
                        style={{
                            width: 60,
                            height: 60,
                            margin: 8,
                            borderRadius: 30,
                            backgroundColor: "#0e0057",
                            justifyContent: "center",
                            alignItems: "center",
                            
                        }}
                    >
                        <Text style={{ fontSize: 20, color: "#fff", }}>⌫</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}