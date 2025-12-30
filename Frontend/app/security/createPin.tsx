import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { setPin as savePin } from "@/security/pin";
import { usePinStore } from "@/store/pinStore";
import { router } from "expo-router";

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function CreatePinScreen() {
    const [pin, setPinState] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState<"enter" | "confirm">("enter");
    const [error, setError] = useState("");

    const { checkPinExists, unlock } = usePinStore();

    // 🔹 Auto-advance logic
    useEffect(() => {
        if (step === "enter" && pin.length === 4) {
            setStep("confirm");
            setError("");
        } else if (step === "confirm" && confirmPin.length === 4) {
            handleSave();
        }
    }, [pin, confirmPin]);

    const handleNumberPress = (num: string) => {
        setError(""); // Clear error on type
        if (step === "enter" && pin.length < 4) setPinState(pin + num);
        if (step === "confirm" && confirmPin.length < 4) setConfirmPin(confirmPin + num);
    };

    const handleBackspace = () => {
        if (step === "enter") setPinState(pin.slice(0, -1));
        if (step === "confirm") setConfirmPin(confirmPin.slice(0, -1));
    };

    const handleSave = async () => {
        if (confirmPin !== pin) {
            setError("PINs do not match");
            setConfirmPin("");
            return;
        }

        await savePin(pin);
        await checkPinExists();
        unlock();
        router.replace("/");
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
        <View style={{ flex: 1, backgroundColor: "#f9f9f9", justifyContent: "center", padding: 30 }}>
            {/* 🔹 Matching UnlockScreen Logo */}
            <View style={{ alignItems: "center" }}>
                <Image
                    source={require("@/assets/images/icon.png")}
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                />
            </View>

            <View style={{ backgroundColor: "#f9f9f9", paddingVertical: 5, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>
                    {step === "enter" ? "Create a PIN" : "Confirm PIN"}
                </Text>
                <Text style={{ fontSize: 14, color: "gray", marginBottom: 20 }}>
                    {step === "enter" ? "Enter a 4-digit PIN" : "Enter your PIN again"}
                </Text>

                {renderDots(step === "enter" ? pin.length : confirmPin.length)}

                {/* 🔹 Matching Stable Error Container */}
                <View style={{ height: 25 }}>
                    {error ? <Text style={{ color: "red", fontSize: 13 }}>{error}</Text> : null}
                </View>

                {/* Numeric Keypad */}
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

                    {/* 🔹 Matching Dark Blue Backspace */}
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
                        <Text style={{ fontSize: 20, color: "#fff" }}>⌫</Text>
                    </TouchableOpacity>
                </View>

                {/* Optional: Add a button to go back to 'Enter' step if there's a mistake in Confirm */}
                {step === "confirm" && (
                    <TouchableOpacity
                        onPress={() => { setStep("enter"); setConfirmPin(""); setPinState(""); }}
                        style={{ marginTop: 20 }}
                    >
                        <Text style={{ color: "#0e0057", fontWeight: "600" }}>Start Over</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}