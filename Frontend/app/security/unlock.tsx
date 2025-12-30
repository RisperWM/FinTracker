import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { verifyPin } from "@/security/pin";
import { usePinStore } from "@/store/pinStore";
import { handleFailedAttempt, resetAttempts, isLockedOut } from "@/security/lockout";
import { router } from "expo-router";

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function UnlockScreen() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const { unlock } = usePinStore();

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) setPin(pin + num);
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
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
                {dots}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f9f9f9", justifyContent: "center", padding: 20 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>Enter Your PIN</Text>
                <Text style={{ fontSize: 14, color: "gray", marginBottom: 20 }}>Secure your account</Text>

                {renderDots(pin.length)}
                {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

                {/* Numeric keypad */}
                <View style={{ width: "100%", flexWrap: "wrap", flexDirection: "row", justifyContent: "center" }}>
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
                            backgroundColor: "#ccc",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ fontSize: 20 }}>⌫</Text>
                    </TouchableOpacity>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                    onPress={handleUnlock}
                    style={{
                        marginTop: 20,
                        backgroundColor: "#0e0057",
                        paddingVertical: 12,
                        paddingHorizontal: 50,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
