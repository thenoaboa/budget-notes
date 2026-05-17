import { StyleSheet, Text, View } from "react-native";

export default function WeddingBudgetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wedding Budget</Text>
      <Text style={styles.subtitle}>This is the wedding budget page.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 24, paddingTop: 60 },
  title: { color: "white", fontSize: 36, fontWeight: "bold" },
  subtitle: { color: "#9ca3af", marginTop: 12, fontSize: 16 },
});
