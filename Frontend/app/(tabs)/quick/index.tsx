// app/quick/index.tsx
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Quick() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Quick Action Page 🚀</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { fontSize: 20, fontWeight: "600" },
});
