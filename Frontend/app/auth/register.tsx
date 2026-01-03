import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Image } from "react-native";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Logo from "../../assets/images/icon.png"

const Register = () => {
    const { register, error, loading } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Identity fields
    const [firstname, setFirstname] = useState("");
    const [middlename, setMiddlename] = useState("");
    const [surname, setSurname] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "other">("male");

    // 🔹 Country Code & Phone
    const [countryCode, setCountryCode] = useState("+254");
    const [phonenumber, setPhonenumber] = useState("");
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const countryCodes = [
        { code: "+254", flag: "🇰🇪" },
        { code: "+255", flag: "🇹🇿" },
        { code: "+256", flag: "🇺🇬" },
        { code: "+1", flag: "🇺🇸" },
    ];

    const handleRegister = async () => {
        // 🔹 Validation Logic
        if (!email || !password || !firstname || !surname || !phonenumber) {
            alert("Please fill in all required fields.");
            return;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Combine code and number
        const fullPhone = `${countryCode}${phonenumber.replace(/^0+/, '')}`;

        await register({
            email,
            password,
            firstname,
            middlename,
            surname,
            gender,
            phonenumber: fullPhone,
        });

        if (!error) {
            router.replace("/security/createPin");
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
                <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                        style={styles.countryPicker}
                        onPress={() => setShowCountryPicker(!showCountryPicker)}
                    >
                        <Text style={styles.countryPickerText}>{countryCode}</Text>
                        <Ionicons name="chevron-down" size={14} color="gray" />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="712345678"
                        value={phonenumber}
                        onChangeText={setPhonenumber}
                        keyboardType="phone-pad"
                    />
                </View>

                {showCountryPicker && (
                    <View style={styles.dropdown}>
                        {countryCodes.map((item) => (
                            <TouchableOpacity
                                key={item.code}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setCountryCode(item.code);
                                    setShowCountryPicker(false);
                                }}
                            >
                                <Text>{item.flag} {item.code}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

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
    logoContainer: { alignItems: "center" },
    logo: { width: 120, height: 120 },
    title: { fontSize: 24, fontWeight: "600", marginBottom: 20, textAlign: "center", color: "#0e0057" },
    label: { textTransform: "uppercase", color: "gray", fontWeight: "bold", marginBottom: 9 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 5, marginBottom: 20 },
    phoneInputContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 10,
        borderRadius: 5,
        gap: 5
    },
    countryPickerText: { fontWeight: "bold", color: "#0e0057" },
    dropdown: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginTop: -15,
        marginBottom: 20
    },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
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