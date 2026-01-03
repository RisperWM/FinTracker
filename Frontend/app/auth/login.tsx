import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Logo from "../../assets/images/icon.png";
import { pinExists } from "@/security/pin";
import { usePinStore } from "@/store/pinStore";

const Login = () => {
    const { login, error: serverError, loading, clearError } = useAuthStore();
    const { unlock } = usePinStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Clear errors when the user starts typing again
    useEffect(() => {
        if (localError) setLocalError(null);
        if (serverError) clearError();
    }, [email, password]);

    const validateForm = () => {
        const emailRegex = /\S+@\S+\.\S+/;

        if (!email.trim() || !password.trim()) {
            setLocalError("Please fill in all fields.");
            return false;
        }
        if (!emailRegex.test(email)) {
            setLocalError("Please enter a valid email address.");
            return false;
        }
        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        const success = await login(email, password);
        if (success) {
            const hasPin = await pinExists();
            if (hasPin) {
                unlock();
                router.replace("/security/unlock");
            } else {
                router.replace("/security/createPin");
            }
        }
    };

    const displayError = localError || serverError;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#fff" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.logoContainer}>
                    <Image source={Logo} style={styles.logo} resizeMode="contain" />
                </View>

                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Log in to manage your identity architecture</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={[styles.input, displayError && !email ? styles.inputError : null]}
                        placeholder="example@mail.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#94a3b8"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }, displayError && password.length < 6 ? styles.inputError : null]}
                            placeholder="Min. 6 characters"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#94a3b8"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={22}
                                color="#64748b"
                            />
                        </TouchableOpacity>
                    </View>

                    {displayError ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color="#ef4444" />
                            <Text style={styles.errorText}>{displayError}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.loginBtnText}>Authenticating...</Text>
                        ) : (
                            <Text style={styles.loginBtnText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.signIn}>
                        <Text style={styles.signInText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => router.push("/auth/register")}>
                            <Text style={styles.signInBtn}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
    logoContainer: { alignItems: "center", marginBottom: 10 },
    logo: { width: 100, height: 100 },
    title: { fontSize: 28, fontWeight: "900", textAlign: "center", color: "#0e0057" },
    subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 30, marginTop: 5 },
    form: { width: "100%" },
    label: { fontSize: 11, textTransform: "uppercase", color: "#64748b", fontWeight: "800", marginBottom: 8, letterSpacing: 1 },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: "#f8fafc",
        color: "#1e293b",
        fontWeight: "600"
    },
    inputError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
    passwordWrapper: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    eyeIcon: { position: 'absolute', right: 15 },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: 15,
        backgroundColor: "#fef2f2",
        padding: 10,
        borderRadius: 8
    },
    errorText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },
    loginBtn: {
        backgroundColor: "#0e0057",
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#0e0057",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    loginBtnDisabled: { backgroundColor: "#94a3b8" },
    loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
    signIn: { marginTop: 25, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 5 },
    signInText: { color: "#64748b", fontWeight: "600" },
    signInBtn: { fontWeight: "800", color: "#0e0057" }
});