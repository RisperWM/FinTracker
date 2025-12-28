import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Image } from "react-native";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Logo from "../../assets/images/FinTracker-icon.png"

const Register = () => {
    const { register, error, loading } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // New fields
    const [firstname, setFirstname] = useState("");
    const [middlename, setMiddlename] = useState("");
    const [surname, setSurname] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "other">("male");
    const [phonenumber, setPhonenumber] = useState("");

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        await register({
            email,
            password,
            firstname,
            middlename,
            surname,
            gender,
            phonenumber,
        });

        if (!error) {
            router.push("/");
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
                keyboardShouldPersistTaps="handled">

                <View style={styles.logoContainer}>
                    <Image source={Logo} style={styles.logo} resizeMode="contain" />
                </View>

                <Text style={styles.title}>Create Account</Text>

                <Text style={styles.label}>First name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your firstname"
                    value={firstname}
                    onChangeText={setFirstname}
                />

                <Text style={styles.label}>Middle name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your middlename"
                    value={middlename}
                    onChangeText={setMiddlename}
                />

                <Text style={styles.label}>Surname:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your surname"
                    value={surname}
                    onChangeText={setSurname}
                />

                <Text style={styles.label}>Gender:</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                    {["male", "female", "other"].map(g => (
                        <TouchableOpacity key={g} onPress={() => setGender(g as "male" | "female" | "other")}>
                            <Text style={[styles.genderOption, gender === g && styles.genderSelected]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Phone Number:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={phonenumber}
                    onChangeText={setPhonenumber}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
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

                <Text style={styles.label}>Confirm Password:</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="gray" style={{ marginLeft: -35 }} />
                    </TouchableOpacity>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.loginBtnText}>{loading ? "Registering..." : "Register"}</Text>
                </TouchableOpacity>

                <View style={styles.signIn}>
                    <Text style={styles.signInText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push("/auth/login")}>
                        <Text style={styles.signInBtn}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;

const styles = StyleSheet.create({
    logoContainer: { alignItems: "center", marginBottom: 10 },
    logo: { width: 100, height: 100 },
    title: { fontSize: 24, fontWeight: "600", marginBottom: 20, textAlign: "center", margin: 10, color: "#0e0057" },
    label: { textTransform: "uppercase", color: "gray", fontWeight: "bold", marginBottom: 9 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 5, marginBottom: 20 },
    passwordContainer: { flexDirection: "row", alignItems: "center", borderRadius: 5, marginBottom: 20 },
    error: { color: "red", marginBottom: 10 },
    signIn: { margin: 10, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 5, fontSize: 12 },
    signInText: { fontWeight: "500" },
    signInBtn: { fontWeight: "800", color: "#0e0057" },
    loginBtn: { backgroundColor: "#0e0057", paddingVertical: 14, borderRadius: 25, alignItems: "center", margin: 10 },
    loginBtnDisabled: { backgroundColor: "#aaa" },
    loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    genderOption: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
    genderSelected: { backgroundColor: "#0e0057", color: "#fff", borderColor: "#0e0057" },
});
