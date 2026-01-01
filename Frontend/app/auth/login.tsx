import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Image, Alert } from "react-native";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Logo from "../../assets/images/icon.png";
import { useEffect } from "react";
import { pinExists } from "@/security/pin";
import { usePinStore } from "@/store/pinStore";

const Login = () => {
    const { login, error, loading } = useAuthStore();
    const { unlock } = usePinStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const success = await login(email, password);
        if (success) {
            const hasPin = await pinExists();

            if (hasPin) {
                unlock(); // reset pin unlocked state
                router.replace("/security/unlock");
            } else {
                router.replace("/security/createPin");
            }
        }
    };

    useEffect(() => {
        if (error) {
            console.error("Auth Error:", error);
        }
    }, [error]);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }} keyboardShouldPersistTaps="handled">
                <View style={styles.logoContainer}>
                    <Image source={Logo} style={styles.logo} resizeMode="contain" />
                </View>

                <Text style={styles.title}>Welcome !</Text>

                <Text style={styles.label}>Username:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Password:</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" style={{ marginLeft: -35 }} />
                    </TouchableOpacity>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginBtnText}>{loading ? "Logging in..." : "Login"}</Text>
                </TouchableOpacity>

                <View style={styles.signIn}>
                    <Text style={styles.signInText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push("/auth/register")}>
                        <Text style={styles.signInBtn}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    logoContainer: { alignItems: "center" },
    logo: { width: 120, height: 120 },
    title: { fontSize: 24, fontWeight: "600", marginBottom: 20, textAlign: "center", color: "#0e0057" },
    label: { textTransform: "uppercase", color: "gray", fontWeight: "bold", marginBottom: 9 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 5, marginBottom: 20 },
    passwordContainer: { flexDirection: "row", alignItems: "center", borderRadius: 5, marginBottom: 20 },
    error: { color: "red", marginBottom: 10 },
    signIn: { margin: 10, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 5, fontSize: 12 },
    signInText: { fontWeight: "500" },
    signInBtn: { fontWeight: "800", color: "#0e0057" },
    loginBtn: { backgroundColor: "#0e0057", paddingVertical: 14, borderRadius: 25, alignItems: "center", margin: 10 },
    loginBtnDisabled: { backgroundColor: "#aaa" },
    loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
