import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { setPin as savePin } from "@/security/pin"; // renamed to avoid conflict
import { usePinStore } from "@/store/pinStore";
import { router } from "expo-router";

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function CreatePinScreen() {
    const [pin, setPinState] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState<"enter" | "confirm">("enter");
    const [error, setError] = useState("");

    const { checkPinExists, unlock } = usePinStore();

    const handleNumberPress = (num: string) => {
        if (step === "enter" && pin.length < 4) setPinState(pin + num);
        if (step === "confirm" && confirmPin.length < 4) setConfirmPin(confirmPin + num);
    };

    const handleBackspace = () => {
        if (step === "enter") setPinState(pin.slice(0, -1));
        if (step === "confirm") setConfirmPin(confirmPin.slice(0, -1));
    };

    const handleNext = async () => {
        if (step === "enter") {
            if (pin.length !== 4) {
                setError("PIN must be 4 digits");
                return;
            }
            setStep("confirm");
            setError("");
        } else if (step === "confirm") {
            if (confirmPin !== pin) {
                setError("PINs do not match");
                setConfirmPin("");
                return;
            }

            // ✅ Save PIN correctly
            await savePin(pin);
            await checkPinExists();
            unlock();
            router.replace("/");
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
        return <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>{dots}</View>;
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f9f9f9", justifyContent: "center", padding: 20 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20, alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 10 }}>
                    {step === "enter" ? "Enter a PIN" : "Confirm PIN"}
                </Text>
                <Text style={{ fontSize: 14, color: "gray", marginBottom: 20 }}>
                    {step === "enter" ? "Create a 4-digit PIN" : "Confirm your PIN"}
                </Text>

                {renderDots(step === "enter" ? pin.length : confirmPin.length)}
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

                {/* Next / Save button */}
                <TouchableOpacity
                    onPress={handleNext}
                    style={{
                        marginTop: 20,
                        backgroundColor: "#0e0057",
                        paddingVertical: 12,
                        paddingHorizontal: 50,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                        {step === "enter" ? "Next" : "Save PIN"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
